type SetDefaultButtonProps = {
  action: () => Promise<void>
}

export default function SetDefaultButton({
  action,
}: SetDefaultButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
      >
        Set as default
      </button>
    </form>
  )
}