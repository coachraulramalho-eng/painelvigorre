import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Criar permissões
  const modules = ['dashboard', 'commercial', 'financial', 'marketing', 'admin', 'security', 'settings'];
  const actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
  const scopes = ['all', 'own', 'team'];

  const permissions = [];
  for (const module of modules) {
    for (const action of actions) {
      permissions.push(
        prisma.permission.upsert({
          where: {
            module_action_scope: {
              module,
              action,
              scope: 'all',
            },
          },
          update: {},
          create: {
            module,
            action,
            scope: 'all',
            description: `${action} ${module}`,
          },
        })
      );
    }
  }
  await Promise.all(permissions);
  console.log('✅ Permissões criadas');

  // 2. Criar roles
  const roles = [
    { name: 'ADM Master', description: 'Acesso total ao sistema', isMaster: true },
    { name: 'Gestor Comercial', description: 'Acesso completo ao módulo Comercial' },
    { name: 'Comercial', description: 'Acesso às funções comerciais autorizadas' },
    { name: 'Representante', description: 'Acesso restrito a seus próprios registros' },
    { name: 'Financeiro', description: 'Acesso ao módulo Financeiro' },
    { name: 'Marketing', description: 'Acesso ao módulo Marketing' },
    { name: 'Administrativo', description: 'Acesso ao módulo Administrativo' },
    { name: 'Funcionário', description: 'Perfil genérico com permissões específicas' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles criadas');

  // 3. Criar usuário ADM Master
  const adminPassword = await hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vigorre.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@vigorre.com',
      password: adminPassword,
      active: true,
    },
  });

  // Vincular role ADM Master
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADM Master' },
  });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  }

  console.log('✅ Usuário ADM Master criado: admin@vigorre.com / admin123');

  // 4. Criar perfis padrão com permissões básicas
  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
