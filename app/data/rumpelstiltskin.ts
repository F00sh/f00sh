export type StoryVector = [number, number, number];

export type StorySceneType =
  | 'mill-stream'
  | 'king-arrival'
  | 'straw-chamber'
  | 'gold-spinning'
  | 'greed-chamber'
  | 'dwarf-bargain'
  | 'queen-and-child'
  | 'messengers'
  | 'forest-hut'
  | 'name-reveal'
  | 'floor-escape';

export interface StorySectionData {
  id: string;
  title: string;
  text: string;
  sceneType: StorySceneType;
  cameraPosition: StoryVector;
  cameraTarget: StoryVector;
  animationCue: string;
}

export const rumpelstiltskinSections: StorySectionData[] = [
  {
    id: 'mill-by-the-stream',
    title: 'The Miller Beside the Water',
    text: 'At the edge of a dark forest stood a mill beside a narrow stream. The miller talked too freely, and one boast in particular drifted farther than he intended.',
    sceneType: 'mill-stream',
    cameraPosition: [0, 5.5, 12],
    cameraTarget: [0, 2.1, 0],
    animationCue: 'Water glints under the wheel while lantern haze moves through the trees.',
  },
  {
    id: 'king-from-the-woods',
    title: 'A King Hears the Tale',
    text: 'A king came riding out of the woods and heard the miller claim that his daughter could spin straw into gold. The lie, once spoken aloud, began to harden into fate.',
    sceneType: 'king-arrival',
    cameraPosition: [3.8, 4.8, 11.5],
    cameraTarget: [0, 1.8, 0],
    animationCue: 'Branches sway as the rider advances and cold light catches on a crown.',
  },
  {
    id: 'first-locked-room',
    title: 'The Locked Chamber',
    text: 'The girl was brought to a chamber piled high with straw. The king shut the door behind her and promised death by morning if she could not do what her father had sworn.',
    sceneType: 'straw-chamber',
    cameraPosition: [-3.5, 4.5, 10.5],
    cameraTarget: [0, 1.7, 0],
    animationCue: 'Dust floats in a shaft of moonlight and the straw shifts like a dry sea.',
  },
  {
    id: 'straw-to-gold',
    title: 'The Wheel Begins',
    text: 'When she wept, a small strange man appeared and asked what she would give him. For a necklace he sat to the wheel, and before dawn the straw shone as spun gold.',
    sceneType: 'gold-spinning',
    cameraPosition: [1.6, 4.2, 9.4],
    cameraTarget: [0, 1.6, 0],
    animationCue: 'The spinning wheel whirs, sparks lift, and strands brighten from straw-brown to gold.',
  },
  {
    id: 'greed-expands',
    title: 'The King Wants More',
    text: 'The king saw the gold and his hunger grew. He led her into a larger chamber, heaped even higher with straw, and demanded the miracle again.',
    sceneType: 'greed-chamber',
    cameraPosition: [-4.4, 5.1, 12.6],
    cameraTarget: [0, 2.2, 0],
    animationCue: 'Tall walls loom while gold stacks catch a restless, grasping shimmer.',
  },
  {
    id: 'the-bargain',
    title: 'The Final Bargain',
    text: 'Once more the little man came. For a ring he spun, and on the third night, when nothing else remained to trade, he asked for her first child if she became queen.',
    sceneType: 'dwarf-bargain',
    cameraPosition: [2.5, 4.1, 9.8],
    cameraTarget: [0, 1.4, 0],
    animationCue: 'Candlelight flickers between two figures while a contract of shadow closes in.',
  },
  {
    id: 'queen-and-baby',
    title: 'A Queen and Her Child',
    text: 'In time she became queen and bore a child. Then the little man returned to claim what had been promised in the darkest hour.',
    sceneType: 'queen-and-child',
    cameraPosition: [-2.3, 4.3, 10.8],
    cameraTarget: [0, 1.9, 0],
    animationCue: 'Curtains breathe with the night air while warm firelight gathers around the cradle.',
  },
  {
    id: 'searching-the-land',
    title: 'Messengers Ride Everywhere',
    text: 'She begged for mercy, and he granted three days. Messengers crossed fields, roads, villages, and forests, gathering every curious name they could find.',
    sceneType: 'messengers',
    cameraPosition: [0.5, 5.7, 13.4],
    cameraTarget: [0, 2.4, 0],
    animationCue: 'Mounted silhouettes pass through layered hills as banners snap in the wind.',
  },
  {
    id: 'dancing-hut',
    title: 'The Hut in the Woods',
    text: 'On the third day a messenger found a little hut deep in the forest. Before it, a fire burned, and around it danced the strange man singing his own secret name.',
    sceneType: 'forest-hut',
    cameraPosition: [3.3, 4.6, 10.2],
    cameraTarget: [0, 1.5, 0],
    animationCue: 'Firelight pulses against the hut while the dwarf spins in a tight, delighted circle.',
  },
  {
    id: 'the-name',
    title: 'Rumpelstiltskin',
    text: 'In the throne room he sneered as she guessed one name after another. At last she spoke the hidden name he thought no one could know: Rumpelstiltskin.',
    sceneType: 'name-reveal',
    cameraPosition: [-1.4, 4.9, 11.2],
    cameraTarget: [0, 2, 0],
    animationCue: 'Letters flare above the dais and the court freezes around the single spoken word.',
  },
  {
    id: 'rage-and-escape',
    title: 'Rage in the Floorboards',
    text: 'At the sound of his name he howled with fury. He stamped so hard that one foot sank into the floor, then tore himself free and vanished forever.',
    sceneType: 'floor-escape',
    cameraPosition: [2.8, 4.2, 9.6],
    cameraTarget: [0, 1.3, 0],
    animationCue: 'The floor cracks, embers burst, and the final figure drops into darkness.',
  },
];
