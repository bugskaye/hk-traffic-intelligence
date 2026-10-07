export function FoldMark(props: { open: boolean }) {
  return <span aria-hidden="true" className={props.open ? "fold-mark fold-mark-down" : "fold-mark fold-mark-up"} />
}
