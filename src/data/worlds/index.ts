import { World, WorldCategory, Difficulty, TriviaQuestion, TrueFalseQuestion, Character } from '../../types';
import { narutoWorld } from './naruto';
import { rezeroWorld } from './rezero';

export const allWorlds: World[] = [
  narutoWorld,
  rezeroWorld,
];

export const chaosWorld: World = {
  id: 'chaos_realm',
  name: {
    ar: 'عالم الفوضى الكونية',
    en: 'The Chaos Cosmic Realm'
  },
  category: 'anime', // Multi-category
  tagline: {
    ar: 'حيث تندمج كل العوالم، الأساطير، والأسئلة في ساحة واحدة لا ترحم',
    en: 'Where all worlds, legends, and challenges collide into one ruthless arena'
  },
  description: {
    ar: 'تحدَّ عقلك في عالم يجمع عشوائياً أسئلة وشخصيات جميع عوالم الأنمي والألعاب دفعة واحدة. من يتقنه يحصل على لقب "The Ultimate King of the Universe"!',
    en: 'Test your mastery across a blended cosmos of anime and games. Master it to claim "The Ultimate King of the Universe" title!'
  },
  icon: '🔮',
  banner: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
  themeColor: '#6366f1',
  accentGlow: 'rgba(99, 102, 241, 0.6)',
  characters: [], // Dynamically loaded
  triviaQuestions: [],
  trueFalseQuestions: []
};

export type ChaosFilter = 'all' | 'anime' | 'games';

export function getChaosCharacters(filter: ChaosFilter = 'all'): Character[] {
  let list = allWorlds;
  if (filter === 'anime') {
    list = allWorlds.filter(w => w.category === 'anime');
  } else if (filter === 'games') {
    list = allWorlds.filter(w => w.category === 'games');
  }
  return list.flatMap(w => w.characters);
}

export function getChaosTriviaQuestions(filter: ChaosFilter = 'all', difficulty?: Difficulty): TriviaQuestion[] {
  let list = allWorlds;
  if (filter === 'anime') {
    list = allWorlds.filter(w => w.category === 'anime');
  } else if (filter === 'games') {
    list = allWorlds.filter(w => w.category === 'games');
  }
  const allQ = list.flatMap(w => w.triviaQuestions);
  if (difficulty) {
    return allQ.filter(q => q.difficulty === difficulty);
  }
  return allQ;
}

export function getChaosTrueFalseQuestions(filter: ChaosFilter = 'all', difficulty?: Difficulty): TrueFalseQuestion[] {
  let list = allWorlds;
  if (filter === 'anime') {
    list = allWorlds.filter(w => w.category === 'anime');
  } else if (filter === 'games') {
    list = allWorlds.filter(w => w.category === 'games');
  }
  const allQ = list.flatMap(w => w.trueFalseQuestions);
  if (difficulty) {
    return allQ.filter(q => q.difficulty === difficulty);
  }
  return allQ;
}

export function getWorldById(worldId: string): World | undefined {
  if (worldId === 'chaos_realm') {
    return {
      ...chaosWorld,
      characters: getChaosCharacters('all'),
      triviaQuestions: getChaosTriviaQuestions('all'),
      trueFalseQuestions: getChaosTrueFalseQuestions('all')
    };
  }
  return allWorlds.find(w => w.id === worldId);
}
