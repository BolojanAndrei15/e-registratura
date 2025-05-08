const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // Exemplu de seed pentru roluri, permisiuni și utilizatori
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      color: '#6366f1',
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'user',
      color: '#34d399',
    },
  });

  const createPermission = await prisma.permission.create({
    data: {
      name: 'create_document',
      description: 'Permite crearea unui document nou',
    },
  });

  await prisma.rolePermission.create({
    data: {
      roleId: adminRole.id,
      permissionId: createPermission.id,
    },
  });

  // Criptarea parolei
  const password = '1234'; // Folosește parola dorită
  const passwordHash = await bcrypt.hash(password, 10); // 10 reprezintă numărul de "salt rounds" pentru bcrypt

  const adminUser = await prisma.user.create({
    data: {
      email: 'bolojanandrei539@gmail.com',
      passwordHash: passwordHash, // Salvează parola criptată
      name: 'Bolojan Andrei',
      roleId: adminRole.id,
    },
  });

  console.log('Seed completat cu succes!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
