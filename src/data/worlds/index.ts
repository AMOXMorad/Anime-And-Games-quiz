import { World, WorldType, Difficulty, TriviaQuestion, TrueFalseQuestion, Character } from '../../types';
import { getLoadedCustomWorlds, saveCustomWorldToDb, deleteCustomWorldFromDb, clearAllCustomWorldsStorage } from '../../lib/indexedDbStorage';

export const BUILT_IN_WORLDS: World[] = [];

// Helper to get custom worlds created by admin
export function getCustomWorlds(): World[] {
  return getLoadedCustomWorlds();
}

// Helper to get all active worlds (built-in + admin created)
export function getAllWorlds(): World[] {
  const custom = getCustomWorlds();
  return [...BUILT_IN_WORLDS, ...custom];
}

// Backward-compatible export getter
export const allWorlds: World[] = getAllWorlds();

export function saveCustomWorld(world: World): Promise<void> | void {
  return saveCustomWorldToDb(world);
}

export function deleteCustomWorld(worldId: string): Promise<void> | void {
  return deleteCustomWorldFromDb(worldId);
}

export function clearAllCustomWorlds(): Promise<void> {
  return clearAllCustomWorldsStorage();
}

export const chaosWorld: World = {
  id: 'chaos_realm',
  name: {
    ar: 'عالم الفوضى الكونية',
    en: 'The Chaos Cosmic Realm'
  },
  category: 'anime', // Default representation
  tagline: {
    ar: 'حيث تندمج كل العوالم، الأساطير، والأسئلة في ساحة واحدة لا ترحم',
    en: 'Where all worlds, legends, and challenges collide into one ruthless arena'
  },
  description: {
    ar: 'تحدَّ عقلك في عالم يجمع عشوائياً أسئلة وشخصيات جميع عوالم الأنمي والألعاب والأبطال الخارقين دفعة واحدة مع مكافأة +30% XP!',
    en: 'Test your mastery across a blended cosmos of anime, games, and superheroes with +30% XP bonus!'
  },
  icon: '🔮',
  banner: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
  themeColor: '#6366f1',
  accentGlow: 'rgba(99, 102, 241, 0.6)',
  characters: [], // Dynamically loaded
  triviaQuestions: [],
  trueFalseQuestions: []
};

export type ChaosFilter = 'all' | 'anime' | 'games' | 'superheroes' | WorldType[];

export function getFilteredWorlds(filter: ChaosFilter = 'all'): World[] {
  const currentWorlds = getAllWorlds();
  if (filter === 'all') return currentWorlds;
  if (Array.isArray(filter)) {
    if (filter.length === 0) return currentWorlds;
    return currentWorlds.filter(w => filter.includes(w.category));
  }
  return currentWorlds.filter(w => w.category === filter);
}

export function getChaosCharacters(filter: ChaosFilter = 'all'): Character[] {
  const list = getFilteredWorlds(filter);
  return list.flatMap(w => w.characters);
}

export function getChaosTriviaQuestions(filter: ChaosFilter = 'all', difficulty?: Difficulty): TriviaQuestion[] {
  const list = getFilteredWorlds(filter);
  const allQ = list.flatMap(w => w.triviaQuestions);
  if (difficulty) {
    return allQ.filter(q => q.difficulty === difficulty);
  }
  return allQ;
}

export function getChaosTrueFalseQuestions(filter: ChaosFilter = 'all', difficulty?: Difficulty): TrueFalseQuestion[] {
  const list = getFilteredWorlds(filter);
  const allQ = list.flatMap(w => w.trueFalseQuestions);
  if (difficulty) {
    return allQ.filter(q => q.difficulty === difficulty);
  }
  return allQ;
}

export function shuffleTriviaOptions(q: TriviaQuestion): TriviaQuestion {
  const indexed = q.options.map((opt, i) => ({ opt, isOriginalCorrect: i === q.correctIndex }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = indexed[i];
    indexed[i] = indexed[j];
    indexed[j] = temp;
  }
  const newOptions = indexed.map(item => item.opt) as [any, any, any, any];
  const newCorrectIndex = indexed.findIndex(item => item.isOriginalCorrect);

  return {
    ...q,
    options: newOptions,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0
  };
}

export function getWorldById(worldId: string, filter: ChaosFilter = 'all'): World | undefined {
  if (worldId === 'chaos_realm') {
    return {
      ...chaosWorld,
      characters: getChaosCharacters(filter),
      triviaQuestions: getChaosTriviaQuestions(filter).map(shuffleTriviaOptions),
      trueFalseQuestions: getChaosTrueFalseQuestions(filter)
    };
  }
  const currentWorlds = getAllWorlds();
  const found = currentWorlds.find(w => w.id === worldId);
  if (found) {
    return {
      ...found,
      triviaQuestions: found.triviaQuestions.map(shuffleTriviaOptions)
    };
  }
  return undefined;
}
