// Variables used by Scriptable.
// icon-color: deep-blue; icon-glyph: book;

// Слово дня — виджет для Scriptable
// Каждый день подтягивает 5 новых слов из words.json в этом репозитории.
// Один и тот же скрипт показывает одно из этих 5 слов в зависимости от
// параметра виджета (Widget Parameter): 1, 2, 3, 4 или 5.
//
// Чтобы листать все 5 слов свайпом на рабочем столе, добавьте этот виджет
// на экран 5 раз (одинакового размера), в каждом экземпляре в настройках
// виджета укажите Parameter: 1, 2, 3, 4 и 5 соответственно, а затем
// перетащите виджеты друг на друга — iOS объединит их в стопку (Stack),
// которую можно листать свайпом вверх/вниз.

const WORDS_URL = "https://raw.githubusercontent.com/vladprihodko2000-beep/word-of-the-day/main/words.json";
const WORDS_PER_DAY = 5;

async function fetchWords() {
  const req = new Request(WORDS_URL);
  req.timeoutInterval = 10;
  return await req.loadJSON();
}

function getDayOfYear() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const today = new Date();
  return Math.floor((today - start) / 86400000);
}

function pickWordsForToday(words, count) {
  const dayOfYear = getDayOfYear();
  const baseIndex = (dayOfYear * count) % words.length;
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(words[(baseIndex + i) % words.length]);
  }
  return result;
}

function getSlot(widgetParameter, count) {
  const parsed = parseInt(widgetParameter, 10);
  if (!parsed || parsed < 1 || parsed > count) {
    return 1;
  }
  return parsed;
}

function buildWidget(entry, errorMessage, slot, total) {
  const widget = new ListWidget();
  widget.setPadding(16, 16, 16, 16);
  widget.backgroundColor = new Color("#1c1c1e");

  if (errorMessage) {
    const errText = widget.addText("Не удалось загрузить слово дня");
    errText.textColor = Color.red();
    errText.font = Font.mediumSystemFont(14);
    widget.addSpacer(4);
    const detail = widget.addText(errorMessage);
    detail.textColor = Color.gray();
    detail.font = Font.systemFont(10);
    return widget;
  }

  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();
  headerStack.centerAlignContent();

  const wordText = headerStack.addText(entry.word);
  wordText.font = Font.boldSystemFont(22);
  wordText.textColor = Color.white();

  if (entry.transcription) {
    headerStack.addSpacer(6);
    const transcriptionText = headerStack.addText(entry.transcription);
    transcriptionText.font = Font.italicSystemFont(13);
    transcriptionText.textColor = Color.gray();
  }

  widget.addSpacer(2);

  const translationText = widget.addText(entry.translation);
  translationText.font = Font.mediumSystemFont(15);
  translationText.textColor = new Color("#5ac8fa");

  widget.addSpacer(8);

  const definitionText = widget.addText(entry.definition);
  definitionText.font = Font.systemFont(12);
  definitionText.textColor = Color.lightGray();
  definitionText.lineLimit = 3;

  if (entry.example) {
    widget.addSpacer(6);
    const exampleText = widget.addText(`"${entry.example}"`);
    exampleText.font = Font.italicSystemFont(11);
    exampleText.textColor = Color.gray();
    exampleText.lineLimit = 2;
  }

  widget.addSpacer();

  const footerStack = widget.addStack();
  footerStack.layoutHorizontally();

  const dotsStack = footerStack.addStack();
  dotsStack.layoutHorizontally();
  dotsStack.spacing = 4;
  for (let i = 1; i <= total; i++) {
    const dot = dotsStack.addText(i === slot ? "●" : "○");
    dot.font = Font.systemFont(8);
    dot.textColor = i === slot ? new Color("#5ac8fa") : Color.darkGray();
  }

  footerStack.addSpacer();

  const counterText = footerStack.addText(`${slot}/${total}`);
  counterText.font = Font.systemFont(10);
  counterText.textColor = Color.darkGray();

  return widget;
}

async function run() {
  let widget;
  try {
    const words = await fetchWords();
    const todayWords = pickWordsForToday(words, WORDS_PER_DAY);
    const slot = getSlot(args.widgetParameter, WORDS_PER_DAY);
    const entry = todayWords[slot - 1];
    widget = buildWidget(entry, null, slot, WORDS_PER_DAY);
  } catch (error) {
    widget = buildWidget(null, error.message, 1, WORDS_PER_DAY);
  }

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    await widget.presentMedium();
  }
  Script.complete();
}

await run();
