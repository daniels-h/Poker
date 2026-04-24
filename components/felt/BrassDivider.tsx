export default function BrassDivider({ my = 24 }: { my?: number }) {
  return (
    <div
      style={{
        marginTop: my,
        marginBottom: my,
        height: 1,
        background: 'linear-gradient(90deg, transparent, #c9a961 50%, transparent)',
      }}
    />
  )
}
