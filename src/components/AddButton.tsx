import type { Word } from '../data/vocab';
import { useDeck } from '../lib/deck';

export function AddButton({ word, source }: { word: Word; source: string }) {
  const { has, add, remove } = useDeck();
  const inDeck = has(word.urdu);
  return (
    <button
      type="button"
      className={`btn ${inDeck ? 'btn-ghost added' : 'btn-soft'}`}
      onClick={(e) => {
        e.stopPropagation();
        if (inDeck) remove(word.urdu);
        else add(word, source);
      }}
      title={inDeck ? 'Remove from your deck' : 'Add to your review deck'}
    >
      {inDeck ? '✓ In deck' : '+ Add to deck'}
    </button>
  );
}
