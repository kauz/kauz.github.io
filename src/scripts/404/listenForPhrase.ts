export function listenForPhrase(phrase: string, onMatch: () => void): void {
  let typed = '';
  window.addEventListener('keydown', (e) => {
    if (e.key.length !== 1) return;
    typed += e.key.toLowerCase();
    if (typed.length > phrase.length + 5) typed = typed.slice(-(phrase.length + 5));
    if (!typed.endsWith(phrase)) return;
    typed = '';
    onMatch();
  });
}
