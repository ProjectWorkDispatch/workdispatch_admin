import User from './user.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';
import { createAuthUser } from '../integrations/auth/auth.client.js';

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
        } else {
            data.profilePhoto = `users/default-profile.png`;
        }

        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

        console.log("REQ BODY:", req.body);

        const authPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            phone: data.phone,
            role: data.role,
            description: data.description || "",
            address: data.address || "",
            latitude: data.latitude || 0,
            longitude: data.longitude || 0
        };

        const authUser = await createAuthUser(authPayload);

        if (!authUser?.id) {
            return res.status(500).json({
                success: false,
                message: "Error creando usuario en AuthService"
            });
        }

        const user = new User({
            ...data,
            authUserId: authUser.id
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            data: user
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

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Correo o contraseña incorrectos'
            });
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'No autorizado: solo administradores pueden iniciar sesión'
            });
        }

        if (user.active === false) {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión de administrador exitoso',
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
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