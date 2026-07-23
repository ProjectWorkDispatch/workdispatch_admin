import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from './user.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

// URL del AuthService (C#) - ajusta el puerto si es diferente
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5149';

/**
 * Registra el usuario en el AuthService (C#/.NET) y devuelve su ID.
 * El AuthService expone POST /api/v1/Auth/register con multipart/form-data.
 */
const createAuthUser = async (payload) => {
    const paths = [
        `${AUTH_SERVICE_URL}/api/v1/Auth/register`,
        `${AUTH_SERVICE_URL}/api/v1/auth/register`,
        `${AUTH_SERVICE_URL}/api/Auth/register`,
    ];

    const params = new URLSearchParams();
    params.append('FirstName', payload.firstName);
    params.append('LastName', payload.lastName);
    params.append('Email', payload.email);
    params.append('Password', payload.password);
    params.append('Phone', payload.phone || '');
    params.append('Role', payload.role || 'CLIENT');

    let lastError;
    for (const url of paths) {
        try {
            const res = await axios.post(url, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 10000,
            });
            // El AuthService devuelve { success, user: { id, ... } }
            const authId = res.data?.user?.id || res.data?.data?.id || res.data?.id;
            if (!authId) throw new Error('AuthService no devolvió un ID de usuario');
            return { id: authId };
        } catch (error) {
            lastError = error;
            // Si es 404 prueba la siguiente ruta, si no, lanza el error
            if (error.response?.status !== 404) throw error;
        }
    }
    throw lastError;
};

// ─────────────────────────────────────────────────────────
const createAccessToken = (user) =>
    jwt.sign(
        { uid: user._id, role: user.role, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
    );

const createRefreshToken = (user) =>
    jwt.sign(
        { uid: user._id, role: user.role, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: '7d' }
    );

const sanitizeUser = (user) => {
    if (!user) return null;
    const safe = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safe.password;
    return safe;
};

// ─────────────────────────────────────────────────────────
export const getUsers = async (req, res) => {
    try {
        const { search, role } = req.query;

        const filter = { role: { $ne: 'ADMIN' } }; // nunca devolver admins

        if (role) filter.role = role;

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .populate({ path: 'skills', populate: { path: 'skillId' } });

        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id)
            .select('-password')
            .populate({ path: 'skills', populate: { path: 'skillId' } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuario', error: error.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const data = { ...req.body };

        if (req.file) {
            data.profilePhoto = req.file.path;
        } else {
            data.profilePhoto = 'users/default-profile.png';
        }

        // Verificar si el correo ya existe en MongoDB
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        }

        console.log("REQ BODY:", req.body);

        // Llamar al AuthService para registrar el usuario allá primero
        const authPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            phone: data.phone,
            role: data.role,
        };

        let authUser;
        try {
            authUser = await createAuthUser(authPayload);
        } catch (authError) {
            const authMsg = authError.response?.data?.message
                || authError.response?.data?.errors?.[0]?.description
                || authError.message
                || 'Error al registrar en AuthService';

            console.error('AuthService error:', authError.response?.data || authError.message);
            return res.status(500).json({ success: false, message: `AuthService: ${authMsg}` });
        }

        if (!authUser?.id) {
            return res.status(500).json({ success: false, message: 'AuthService no devolvió un ID válido' });
        }

        // Crear usuario en MongoDB con el authUserId recibido
        const user = new User({
            ...data,
            authUserId: authUser.id,
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            data: sanitizeUser(user),
        });
    } catch (error) {
        console.error('ERROR CREATE USER:', error);
        res.status(500).json({ success: false, message: 'Error al crear usuario', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const userExist = await User.findById(id);
        if (!userExist) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (req.file) {
            if (userExist.profilePhoto && userExist.profilePhoto.startsWith('http')) {
                try {
                    const photoPath = userExist.profilePhoto;
                    const uploadIndex = photoPath.indexOf('/upload/');
                    if (uploadIndex !== -1) {
                        const afterUpload = photoPath.substring(uploadIndex + 8);
                        const parts = afterUpload.split('/');
                        if (parts[0].startsWith('v')) parts.shift();
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

        const userUpdated = await User.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).select('-password');

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: sanitizeUser(userUpdated),
        });
    } catch (error) {
        console.error('ERROR UPDATE USER:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'No autorizado: solo administradores pueden iniciar sesión' });
        }

        if (user.active === false) {
            return res.status(403).json({ success: false, message: 'Usuario inactivo' });
        }

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión de administrador exitoso',
            accessToken,
            refreshToken,
            expiresIn: 3600,
            userDetails: sanitizeUser(user),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al iniciar sesión', error: error.message });
    }
};

export const changeUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        user.active = !user.active;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Estado del usuario cambiado a ${user.active ? 'ACTIVO' : 'INACTIVO'}`,
            data: sanitizeUser(user),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error cambiando estado del usuario', error: error.message });
    }
};
