import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('API: List models request received');
  try {
    const modelsDir = join(process.cwd(), 'public/models');
    console.log('Models directory path:', modelsDir);
    
    // 检查目录是否存在
    try {
      const dirStats = await stat(modelsDir);
      console.log('Directory stats:', {
        exists: true,
        isDirectory: dirStats.isDirectory(),
        permissions: dirStats.mode,
      });
    } catch (e) {
      console.error('Directory check failed:', e);
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    
    const modelFolders = await readdir(modelsDir);
    console.log('Found model folders:', modelFolders);
    
    const modelGroups = [];
    
    for (const folder of modelFolders) {
      const folderPath = join(modelsDir, folder);
      const files = await readdir(folderPath);
      
      const modelFiles = await Promise.all(
        files.map(async (file) => {
          const filePath = join(folderPath, file);
          const stats = await stat(filePath);
          
          let type = 'unknown';
          if (file.includes('encoder')) type = 'encoder';
          else if (file.includes('decoder')) type = 'decoder';
          else if (file.includes('joiner')) type = 'joiner';
          else if (file.includes('tokens')) type = 'tokens';
          
          return {
            path: `/models/${folder}/${file}`,
            size: stats.size,
            type: type,
            isInt8: file.includes('int8')
          };
        })
      );

      // 检查模型文件的精度
      const modelTypes = modelFiles.filter(f => f.type !== 'tokens');
      const hasInt8Models = modelTypes.some(f => f.isInt8);
      const hasStandardModels = modelTypes.some(f => !f.isInt8);

      // 根据实际模型文件的精度来决定分组
      if (hasInt8Models && !hasStandardModels) {
        modelGroups.push({
          name: `${folder} (INT8)`,
          files: modelFiles.sort((a, b) => a.type.localeCompare(b.type))
        });
      } else if (!hasInt8Models && hasStandardModels) {
        modelGroups.push({
          name: `${folder} (Standard)`,
          files: modelFiles.sort((a, b) => a.type.localeCompare(b.type))
        });
      } else if (hasInt8Models && hasStandardModels) {
        // 两种精度都存在时才分开
        const standardFiles = modelFiles.filter(f => !f.isInt8);
        const int8Files = modelFiles.filter(f => f.isInt8);
        
        if (standardFiles.length > 0) {
          modelGroups.push({
            name: `${folder} (Standard)`,
            files: standardFiles.sort((a, b) => a.type.localeCompare(b.type))
          });
        }
        
        if (int8Files.length > 0) {
          modelGroups.push({
            name: `${folder} (INT8)`,
            files: int8Files.sort((a, b) => a.type.localeCompare(b.type))
          });
        }
      }
    }

    return NextResponse.json(modelGroups, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Failed to list models:', error);
    return NextResponse.json(
      { error: 'Failed to list models' },
      { status: 500 }
    );
  }
} 