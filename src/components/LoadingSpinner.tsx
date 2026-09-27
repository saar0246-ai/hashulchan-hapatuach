export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'
  return (
    <div className="flex items-center justify-center py-8">
      <div className={`${s} border-3 border-primary/20 border-t-primary rounded-full animate-spin`} />
    </div>
  )
}
