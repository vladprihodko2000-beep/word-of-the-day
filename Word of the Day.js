// Variables used by Scriptable.
// icon-color: deep-blue; icon-glyph: book;

// Слово дня — виджет для Scriptable
// Подтягивает словарь из words.json в этом репозитории и показывает
// одно слово, выбранное детерминированно по дню года (одно и то же
// слово весь день, новое — на следующий).

const WORDS_URL = "https://raw.githubusercontent.com/vladprihodko2000-beep/word-of-the-day/main/words.json";

async function fetchWords() {
  const req = new Request(WORDS_URL);
  req.timeoutInterval = 10;
  return await req.loadJSON();
}

function pickWordForToday(words) {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const today = new Date();
  const dayOfYear = Math.floor((today - start) / 86400000);
  const index = dayOfYear % words.length;
  return words[index];
}

function buildWidget(entry, errorMessage) {
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

  return widget;
}

async function run() {
  let widget;
  try {
    const words = await fetchWords();
    const entry = pickWordForToday(words);
    widget = buildWidget(entry);
  } catch (error) {
    widget = buildWidget(null, error.message);
  }

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    await widget.presentMedium();
  }
  Script.complete();
}

await run();
