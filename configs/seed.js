'use strict';

import User from '../src/Users/user.model.js';
import Category from '../src/Categories/category.model.js';
import Skill from '../src/Skill/skill.model.js';
import UserSkill from '../src/UserSkill/userSkill.model.js';

export const seedDefaultData = async () => {
    try {
        const adminEmail = 'admin@workdispatch.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            await User.create({
                firstName: 'Admin',
                lastName: 'WorkDispatch',
                email: adminEmail,
                password: 'Admin123!',
                phone: '0000000000',
                role: 'ADMIN',
                verificationStatus: true,
                active: true,
                address: 'Oficina central',
                description: 'Administrador por defecto creado para pruebas'
            });
            console.log('Seed: usuario administrador creado:', adminEmail);
        }

        let categories = await Category.find();
        if (categories.length === 0) {
            categories = await Category.insertMany([
                { name: 'Electricidad', description: 'Servicios eléctricos residenciales.', status: 'ACTIVE' },
                { name: 'Diseño gráfico', description: 'Diseño de logos y branding.', status: 'ACTIVE' },
                { name: 'Programación', description: 'Desarrollo web y móvil.', status: 'ACTIVE' },
                { name: 'Carpintería', description: 'Trabajos en madera.', status: 'ACTIVE' }
            ]);
            console.log('Seed: categorías de prueba creadas');
        }

        let skills = await Skill.find();
        if (skills.length === 0) {
            skills = await Skill.insertMany([
                { name: 'Instalación de circuitos', categoryId: categories[0]._id, isActive: true },
                { name: 'Reparación de luminarias', categoryId: categories[0]._id, isActive: true },
                { name: 'Diseño web', categoryId: categories[2]._id, isActive: true },
                { name: 'Edición de imágenes', categoryId: categories[1]._id, isActive: true },
                { name: 'Puertas y ventanas', categoryId: categories[3]._id, isActive: true },
                { name: 'Backend con Node.js', categoryId: categories[2]._id, isActive: true }
            ]);
            console.log('Seed: habilidades de prueba creadas');
        }

        let users = await User.find({ role: { $ne: 'ADMIN' } });
        if (users.length === 0) {
            users = await User.insertMany([
                {
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    email: 'juan.perez@example.com',
                    password: 'User1234!',
                    phone: '5551234567',
                    role: 'WORKER',
                    verificationStatus: true,
                    active: true,
                    address: 'Calle Falsa 123',
                    description: 'Electricista con más de 5 años de experiencia'
                },
                {
                    firstName: 'María',
                    lastName: 'González',
                    email: 'maria.gonzalez@example.com',
                    password: 'User1234!',
                    phone: '5559876543',
                    role: 'WORKER',
                    verificationStatus: true,
                    active: true,
                    address: 'Avenida Siempre Viva 456',
                    description: 'Diseñadora gráfica especialista en branding'
                },
                {
                    firstName: 'Carlos',
                    lastName: 'López',
                    email: 'carlos.lopez@example.com',
                    password: 'User1234!',
                    phone: '5557654321',
                    role: 'CLIENT',
                    verificationStatus: false,
                    active: true,
                    address: 'Barrio Centro 789',
                    description: 'Cliente interesado en servicios de tecnología'
                }
            ]);
            console.log('Seed: usuarios de prueba creados');
        }

        const userSkillsCount = await UserSkill.countDocuments();
        if (userSkillsCount === 0 && users.length > 0 && skills.length > 0) {
            const worker1 = users.find((user) => user.role === 'WORKER');
            const worker2 = users.filter((user) => user.role === 'WORKER')[1];
            const skill1 = skills.find((skill) => skill.name.includes('Instalación'));
            const skill2 = skills.find((skill) => skill.name.includes('Diseño web'));
            const skill3 = skills.find((skill) => skill.name.includes('Edición de imágenes'));

            const userSkillEntries = [];
            if (worker1 && skill1) {
                userSkillEntries.push({ userId: worker1._id, skillId: skill1._id, experienceYears: 5 });
            }
            if (worker2 && skill2) {
                userSkillEntries.push({ userId: worker2._id, skillId: skill2._id, experienceYears: 4 });
            }
            if (worker2 && skill3) {
                userSkillEntries.push({ userId: worker2._id, skillId: skill3._id, experienceYears: 2 });
            }

            if (userSkillEntries.length > 0) {
                await UserSkill.insertMany(userSkillEntries);
                console.log('Seed: relaciones usuario-habilidad creadas');
            }
        }
    } catch (error) {
        console.error('Seed error:', error.message);
    }
};
