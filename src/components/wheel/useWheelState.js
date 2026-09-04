import { useEffect, useMemo, useState } from 'react';

/* Реальные составы классов — перенесены как есть с прежней страницы,
   ничего не придумано и не сокращено. */
export const DEFAULTS = [
  { label: '5A', names: ['Paopao','Major','Shop','Win','Photo','Phu','Pete','Poon','Popun','Geo','Lego','Copter','Dhruva','Khun','Arty','Nampunch','Oengoey','Taew','Aunda','Gail','Napran','Milin','Kongkwan','Bright','Nicha','Fasai','Nava','Khaopon','Paint','Focus'] },
  { label: '5B', names: ['Khun','Buakaw','Ikkui','Petar','Pakorn','Techo','Perth','Spock','Prin','Krahm','Chamin','Prem','Chin','Pao','Irine','Fia','Benz','Nada (18)','Nabtang','Tonhom','Pround','Cream','Nada (23)','Jaoei','Kanom','Pun','Kaem','Pat','Stang','Aris'] },
  { label: '5C', names: ['Andew','Beam','Nuea','Kaowpun','Leo','Panther','Rio','Cheetah','Phupat','Tankhun','Pprize','Tawan','Dmax','Imaim','Jean','Data','Drive','Yam','Nicha','Namtan','Eiw','Meya','Baifern','Loma','I-oun','Pungping','Anya','Ongfong'] },
  { label: '3/11 en', names: ['August','Stamp','Coon','Music','Aom-Sin','Poud','Foto','Sky','Jeffy','Phupa','Bank','Bubble','I-Zu','Palm','Namwan','Zoon','Irin','Nuea','Papasorn','Anda','Dear','PAYNA','Aei','Lalit','Punch','Nicha','Jus-min','Ninew','Fahsai'] },
  { label: '3/11 ch', names: ['成功','李荩祥','江河','李可','苏温富','王贝','高才','王小龙','南风','冬雨','陆白','张杰','江月','伟奇','桃李','芳桃','白雪','林喵','林心如','昭君','苏荷','刘美妙','乐丝','小乔','张梦林','艾莎','月亮','无双','元宝'] },
  { label: '4/11 en', names: ['Plu','Captain','Teng','Bhurich','Earth','Jing','AungPao','Sky','Data','Chino','Mon','Aris','Me-Tang','Pancake','Brink','Gam-Sai','In-Daw','Noo-Dee','Ka-Nom-Jeen','Ton-kaw','Tor-Phan','Ma-Prang','Preem','Chom-Poo','Khem','Bai-Bua1','To-ey','Gam','Bai-Bua2','Anta'] },
  { label: '4/11 ch', names: ['金佳蓉','郑伊雯','张明希','德明','刘昊杰','洪帅','源泽','华军','俊源','杨舒南','黄志鸿','叶雨婷','林云萱','秋桂','妍如','林培伦','和莉梦','陈陪洁','丽玲娇','李嘉盈','李梓娜','婷婧','彩兰','琳牧','思甜','安月','茹雪','白玉珍','艾米莉','铂晞'] },
];

const LS_KEY = 'student-picker-v1';

const makeInitialState = () => ({
  grades: DEFAULTS.map((g) => ({ label: g.label, names: [...g.names], picked: [] })),
  current: 0,
  mode: 'wheel',
  removeOnPick: true,
  muted: false,
});

const loadState = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY));
    if (stored && Array.isArray(stored.grades) && stored.grades.length === DEFAULTS.length) {
      return stored;
    }
  } catch {
    /* повреждённый JSON — просто начинаем заново */
  }
  return makeInitialState();
};

/* Вся логика состояния колеса: классы, текущий режим, пул учеников.
   localStorage читается один раз при монтировании и пишется при
   каждом изменении — та же схема, что и в исходной версии. */
export const useWheelState = () => {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      /* хранилище недоступно (приватное окно, квота) — не критично */
    }
  }, [state]);

  const grade = state.grades[state.current];
  /* Каждый режим пересобирает canvas/DOM при смене pool (см. useEffect
     с [pool] в модах) — без useMemo здесь массив был бы НОВОЙ ссылкой
     на каждый рендер (даже когда данные не менялись), и сцена
     пересобиралась бы на любой не связанный ре-рендер, например
     на переключение локального spinning в родителе. */
  const pool = useMemo(
    () => grade.names.filter((name) => !grade.picked.includes(name)),
    [grade.names, grade.picked],
  );

  const updateGrade = (updater) => {
    setState((prev) => {
      const grades = prev.grades.slice();
      grades[prev.current] = updater(grades[prev.current]);
      return { ...prev, grades };
    });
  };

  return {
    state,
    grade,
    pool,
    setCurrent: (index) => setState((prev) => ({ ...prev, current: index })),
    setMode: (mode) => setState((prev) => ({ ...prev, mode })),
    setRemoveOnPick: (value) => setState((prev) => ({ ...prev, removeOnPick: value })),
    setMuted: (value) => setState((prev) => ({ ...prev, muted: value })),
    markPicked: (name) =>
      updateGrade((g) => (g.picked.includes(name) ? g : { ...g, picked: [...g.picked, name] })),
    unmarkPicked: (name) =>
      updateGrade((g) => ({ ...g, picked: g.picked.filter((n) => n !== name) })),
    resetPool: () => updateGrade((g) => ({ ...g, picked: [] })),
    saveEdits: (label, names) =>
      updateGrade((g) => ({
        label,
        names: [...new Set(names)],
        picked: g.picked.filter((n) => names.includes(n)),
      })),
  };
};
