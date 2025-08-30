/**
 * UI Text generation utilities
 * Functions for generating user-facing text messages
 */

export const getRandomSubmittedMessage = () => {
  const submittedMessages = [
    'hmm...',
    'let me think about that...',
    "that's a good question...",
    'tyring not to hallucinate...',
    '100% sure this is the right answer...',
    'got it, one moment...',
    'brb...',
    'this is not going to be easy...',
    'just a sec...',
    'one moment...',
    "that's a tough one...",
  ];
  return submittedMessages[
    Math.floor(Math.random() * submittedMessages.length)
  ];
};

export function getGreetingText(name: string | undefined | null) {
  const showName = name && name?.split(' ')[0]?.length < 8;
  const nameToShow = showName ? name?.split(' ')[0] : 'Human';
  const isMorning = new Date().getHours() < 12 && new Date().getHours() > 6;
  const isLateNight = new Date().getHours() > 20 || new Date().getHours() < 6;

  const morningGreetings = [
    'Up so early, {name}!',
    'Had coffee yet, {name}?',
    "Sun's up, server's up—shall we?",
  ];

  const nightGreetings = [
    "Can't sleep? Tell me what's keeping you up.",
    'Night owls unite!',
  ];

  const greetings = [
    '01001000 01001001 {name}!',
    'Lexel, at you service',
    ...(isMorning ? morningGreetings : []),
    ...(isLateNight ? nightGreetings : []),
  ];

  return greetings[Math.floor(Math.random() * greetings.length)].replace(
    '{name}',
    nameToShow,
  );
}
