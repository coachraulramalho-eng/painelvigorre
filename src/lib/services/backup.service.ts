import { prisma } from '@/lib/db/prisma';
import fs from 'fs';
import path from 'path';

// ========== TIPOS ==========
interface BackupData {
  timestamp: string;
  tables: {
    [key: string]: any[];
  };
}

// ========== BACKUP ==========
export const createBackup = async (): Promise<BackupData> => {
  const tables = [
    'User',
    'Role',
    'Permission',
    'Company',
    'Contact',
    'Lead',
    'Opportunity',
    'Proposal',
    'Activity',
    'Task',
    'Contract',
    'Representative',
    'Commission',
    'AccountReceivable',
    'AccountPayable',
    'PaymentInstallment',
    'PaymentLink',
    'Platform',
    'Revenue',
    'CostCenter',
    'Budget',
    'Employee',
    'Supplier',
    'Document',
  ];

  const backupData: BackupData = {
    timestamp: new Date().toISOString(),
    tables: {},
  };

  for (const table of tables) {
    const data = await (prisma as any)[table].findMany();
    backupData.tables[table] = data;
  }

  return backupData;
};

export const saveBackupFile = async (data: BackupData): Promise<string> => {
  const backupDir = path.join(process.cwd(), 'backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(backupDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  return filepath;
};

export const restoreBackup = async (filepath: string): Promise<boolean> => {
  try {
    const data: BackupData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    
    // Desabilitar constraints
    await prisma.$executeRaw`SET session_replication_role = replica;`;

    // Limpar dados existentes (ordem reversa para evitar violação de FK)
    const tables = Object.keys(data.tables).reverse();
    
    for (const table of tables) {
      await (prisma as any)[table].deleteMany();
    }

    // Inserir novos dados
    for (const table of Object.keys(data.tables)) {
      for (const record of data.tables[table]) {
        await (prisma as any)[table].create({ data: record });
      }
    }

    // Reabilitar constraints
    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;

    return true;
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    return false;
  }
};

export const listBackups = (): { filename: string; size: number; modified: Date }[] => {
  const backupDir = path.join(process.cwd(), 'backups');
  
  if (!fs.existsSync(backupDir)) {
    return [];
  }

  const files = fs.readdirSync(backupDir);
  
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filepath = path.join(backupDir, file);
      const stats = fs.statSync(filepath);
      return {
        filename: file,
        size: stats.size,
        modified: stats.mtime,
      };
    })
    .sort((a, b) => b.modified.getTime() - a.modified.getTime());
};

export const deleteBackup = (filename: string): boolean => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    const filepath = path.join(backupDir, filename);
    fs.unlinkSync(filepath);
    return true;
  } catch (error) {
    console.error('Erro ao deletar backup:', error);
    return false;
  }
};

// ========== BACKUP AUTOMÁTICO ==========
export const scheduleBackup = async (): Promise<void> => {
  try {
    const data = await createBackup();
    await saveBackupFile(data);
    console.log('Backup automático concluído:', new Date().toISOString());
  } catch (error) {
    console.error('Erro no backup automático:', error);
  }
};

// Para executar periodicamente (ex: a cada 24h)
export const startAutoBackup = (intervalHours: number = 24) => {
  // Executar imediatamente
  scheduleBackup();

  // Agendar próximos backups
  setInterval(scheduleBackup, intervalHours * 60 * 60 * 1000);
};
