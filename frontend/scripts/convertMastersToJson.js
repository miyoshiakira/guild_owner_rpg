import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// マスターファイルの定義
const masters = [
  { file: '../src/data/masters/storyEventMaster.ts', export: 'STORY_EVENT_MASTER', json: 'storyEvents.json' },
  { file: '../src/data/masters/equipmentMaster.ts', export: 'EQUIPMENT_MASTER', json: 'equipments.json' },
  { file: '../src/data/masters/enemyMaster.ts', export: 'ENEMY_MASTER', json: 'enemies.json' },
  { file: '../src/data/masters/itemMaster.ts', export: 'ITEM_MASTER', json: 'items.json' },
  { file: '../src/data/masters/skillMaster.ts', export: 'SKILL_MASTER', json: 'skills.json' },
  { file: '../src/data/masters/materialMaster.ts', export: 'MATERIAL_MASTER', json: 'materials.json' },
  { file: '../src/data/masters/craftRecipeMaster.ts', export: 'CRAFT_RECIPE_MASTER', json: 'craftRecipes.json' },
  { file: '../src/data/masters/partyMemberMaster.ts', export: 'PARTY_MEMBER_MASTER', json: 'partyMembers.json' },
  { file: '../src/data/masters/storyNPCMaster.ts', export: 'STORY_NPC_MASTER', json: 'storyNPCs.json' },
  { file: '../src/data/masters/townMaster.ts', export: 'TOWN_MASTER', json: 'towns.json' },
  { file: '../src/data/masters/mapMaster.ts', export: 'MAP_MASTER', json: 'maps.json' },
  { file: '../src/data/masters/elementMaster.ts', export: 'ELEMENT_MASTER', json: 'elements.json' },
  { file: '../src/data/masters/raceMaster.ts', export: 'RACE_MASTER', json: 'races.json' },
  { file: '../src/data/masters/personalityMaster.ts', export: 'PERSONALITY_MASTER', json: 'personalities.json' },
  { file: '../src/data/masters/typeGrowthMaster.ts', export: 'TYPE_GROWTH_MASTER', json: 'typeGrowth.json' },
  { file: '../src/data/masters/bgmMaster.ts', export: 'BGM_MASTER', json: 'bgms.json' },
];

// 出力ディレクトリ
const outputDir = path.join(__dirname, '../public/data/masters');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 各マスターファイルを処理
for (const master of masters) {
  const filePath = path.join(__dirname, master.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${master.file} - file not found`);
    continue;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 配列を抽出
  const arrayMatch = content.match(new RegExp(`export const ${master.export}\\s*:\\s*[^\\[]*\\[(.*?)\\];`, 's'));
  
  if (!arrayMatch) {
    console.log(`Skipping ${master.file} - could not find ${master.export}`);
    continue;
  }
  
  try {
    // 配列文字列をパース
    const arrayString = `[${arrayMatch[1]}]`;
    const data = eval(arrayString);
    
    // JSONファイルに書き込み
    const outputPath = path.join(outputDir, master.json);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Created ${master.json} with ${data.length} items`);
  } catch (error) {
    console.error(`Error processing ${master.file}:`, error.message);
  }
}

console.log('Conversion complete!');
