export interface SearchHistoryProps {
  onSelect: (term: string) => void;
  onClear?: () => void;
}