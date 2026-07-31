import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from './user.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

const AUTH_SERVICE_URL = process.env.AUTH_URL;
const JWT_SECRET = process.env.SECRET_KEY;


const sanitizeUser = (user) => {
    if (!user) return null;
    const safe = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safe.password;
    return safe;
};

const loginAuthUser = async (payload) => {
    const paths = [
        `${AUTH_SERVICE_URL}/Auth/login`,
        `${AUTH_SERVICE_URL}/auth/login`,
        `${AUTH_SERVICE_URL}/login`,
    ];

    const body = {
        email: payload.email,
        password: payload.password,
    };

    let lastError;
    for (const url of paths) {
        try {
            const response = await axios.post(url, body, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            });
            return response.data;
        } catch (error) {
            lastError = error;
            if (error.response?.status !== 404) throw error;
        }
    }
    throw lastError;
};

const refreshAuthUser = async (refreshToken) => {
    const paths = [
        `${AUTH_SERVICE_URL}/Auth/refresh`,
        `${AUTH_SERVICE_URL}/auth/refresh`,
        `${AUTH_SERVICE_URL}/refresh`,
    ];

    const body = { refreshToken };

    let lastError;
    for (const url of paths) {
        try {
            const response = await axios.post(url, body, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            });
            return response.data;
        } catch (error) {
            lastError = error;
            if (error.response?.status !== 404) throw error;
        }
    }

    throw lastError;
};

const getAuthUserId = (authData) =>
    authData?.userDetails?.id
    || authData?.UserDetails?.Id
    || authData?.user?.id
    || authData?.data?.id
    || authData?.id;

const getAuthUserEmail = (authData, fallbackEmail) =>
    authData?.userDetails?.email
    || authData?.UserDetails?.Email
    || authData?.user?.email
    || authData?.data?.email
    || fallbackEmail;

const createAccessToken = (user) =>
    jwt.sign(
        { uid: user._id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

const createAuthUser = async (payload) => {
    const paths = [
        `${AUTH_SERVICE_URL}/Auth/register`,
        `${AUTH_SERVICE_URL}/auth/register`,
        `${AUTH_SERVICE_URL}/register`,
    ];

    const body = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        phone: payload.phone || '',
        role: payload.role || 'CLIENT',
        description: payload.description || '',
        address: payload.address || '',
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
    };

    let lastError;
    for (const url of paths) {
        try {
            const response = await axios.post(url, body, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            });
            const authId = response.data?.user?.id || response.data?.data?.id || response.data?.id;
            if (!authId) throw new Error('AuthService no devolvio un ID de usuario');
            return { id: authId };
        } catch (error) {
            lastError = error;
            if (error.response?.status !== 404) throw error;
        }
    }
    throw lastError;
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario',
            error: error.message
        });
    }
};

export const createUser = async (req, res) => {
    try {
        const data = req.body;

        if (req.file) {
            data.profilePhoto = req.file.path;
        }

        const existingUser = await User.findOne({ email: data.email?.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

        let authUser;
        try {
            authUser = await createAuthUser({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: data.role || 'ADMIN',
                description: data.description,
                address: data.address,
                latitude: data.latitude,
                longitude: data.longitude,
            });
        } catch (authError) {
            const authMsg = authError.response?.data?.message
                || authError.response?.data?.errors?.[0]?.description
                || authError.message
                || 'Error al registrar en AuthService';
            console.error('AuthService error:', authError.response?.data || authError.message);
            return res.status(500).json({ success: false, message: `AuthService: ${authMsg}` });
        }

        const mongoUserData = { ...data };
        delete mongoUserData.password;
        mongoUserData.email = data.email?.toLowerCase();
        mongoUserData.authUserId = authUser.id;

        const user = new User(mongoUserData);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            data: sanitizeUser(user)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const userExist = await User.findById(id);
        if (!userExist) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (req.file) {
            if (
                userExist.profilePhoto &&
                userExist.profilePhoto.startsWith('http')
            ) {
                try {
                    const photoPath = userExist.profilePhoto;

                    const uploadIndex = photoPath.indexOf('/upload/');
                    if (uploadIndex !== -1) {
                        const afterUpload = photoPath.substring(uploadIndex + 8);
                        const parts = afterUpload.split('/');

                        if (parts[0].startsWith('v')) {
                            parts.shift();
                        }

                        const fullPath = parts.join('/');
                        const publicId = fullPath.substring(0, fullPath.lastIndexOf('.'));

                        await cloudinary.uploader.destroy(publicId);
                    }
                } catch (deleteError) {
                    console.error('Error al eliminar imagen anterior:', deleteError);
                }
            }

            data.profilePhoto = req.file.path;
        }

        const userUpdated = await User.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: userUpdated
        });

    } catch (error) {
        console.error('ERROR UPDATE USER:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        let authData;
        try {
            authData = await loginAuthUser({ email: normalizedEmail, password });
        } catch (authError) {
            const status = authError.response?.status;
            const authMsg = authError.response?.data?.message
                || authError.response?.data?.title
                || authError.message
                || 'Error al iniciar sesion en AuthService';

            console.error('AuthService login error:', authError.response?.data || authError.message);

            return res.status(status === 401 || status === 403 ? status : 500).json({
                success: false,
                message: status === 401 ? 'Correo o contrasena incorrectos' : `AuthService: ${authMsg}`
            });
        }

        const authUserId = getAuthUserId(authData);
        const authEmail = getAuthUserEmail(authData, normalizedEmail)?.toLowerCase();
        const searchFilters = [{ email: authEmail }];

        if (authUserId) {
            searchFilters.unshift({ authUserId });
        }

        const user = await User.findOne({ $or: searchFilters });

        if (!user) {
            try {
                const newMongoUser = new User({
                    firstName: authData?.userDetails?.firstName
                        || authData?.UserDetails?.FirstName
                        || authData?.user?.firstName
                        || 'Admin',
                    lastName: authData?.userDetails?.lastName
                        || authData?.UserDetails?.LastName
                        || authData?.user?.lastName
                        || 'System',
                    email: authEmail,
                    role: 'ADMIN',
                    phone: '00000000',
                    active: true,
                    authUserId: authUserId || undefined,
                });
                await newMongoUser.save();
                const accessToken = createAccessToken(newMongoUser);
                return res.status(200).json({
                    success: true,
                    message: 'Inicio de sesion de administrador exitoso',
                    accessToken,
                    refreshToken: authData?.refreshToken || null,
                    expiresIn: 3600,
                    userDetails: sanitizeUser(newMongoUser)
                });
            } catch (createError) {
                console.error('Error auto-creando admin en Mongo:', createError);
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear usuario administrador en la base de datos'
                });
            }
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'No autorizado: solo administradores pueden iniciar sesion'
            });
        }

        if (user.active === false) {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        if (authUserId && user.authUserId !== authUserId) {
            user.authUserId = authUserId;
            await user.save();
        }

        const accessToken = createAccessToken(user);

        res.status(200).json({
            success: true,
            message: 'Inicio de sesion de administrador exitoso',
            accessToken,
            refreshToken: authData?.refreshToken || null,
            expiresIn: 3600,
            userDetails: sanitizeUser(user)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesion',
            error: error.message
        });
    }
};

export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token requerido' });
        }

        let authData;
        try {
            authData = await refreshAuthUser(refreshToken);
        } catch (authError) {
            const status = authError.response?.status;
            const authMsg = authError.response?.data?.message
                || authError.message
                || 'Error al renovar sesion';

            console.error('AuthService refresh error:', authError.response?.data || authError.message);

            return res.status(status === 401 || status === 403 ? status : 500).json({
                success: false,
                message: status === 401 ? 'Sesion invalida o expirada' : `AuthService: ${authMsg}`
            });
        }

        const authUserId = getAuthUserId(authData);
        const authEmail = getAuthUserEmail(authData)?.toLowerCase();
        const searchFilters = authEmail ? [{ email: authEmail }] : [];
        if (authUserId) {
            searchFilters.unshift({ authUserId });
        }

        const user = await User.findOne({ $or: searchFilters });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado en Mongo'
            });
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'No autorizado: solo administradores'
            });
        }

        if (user.active === false) {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        const accessToken = createAccessToken(user);

        res.status(200).json({
            success: true,
            message: 'Sesion renovada',
            accessToken,
            refreshToken: authData?.refreshToken || null,
            expiresIn: 3600,
            userDetails: sanitizeUser(user)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al renovar sesion',
            error: error.message
        });
    }
};

export const changeUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        user.active = !user.active;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Estado del usuario cambiado a ${user.active ? 'ACTIVO' : 'INACTIVO'}`,
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cambiando estado del usuario',
            error: error.message
        });
    }
};