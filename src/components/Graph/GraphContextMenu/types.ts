export interface GraphContextMenuProps {
  x: number;
  y: number;
  node: any;
  onClose: () => void;
  onSearch?: () => void;
  onCopy?: () => void;
  copiedAddress: boolean;
}