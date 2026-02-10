import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function RepoAccessBox({ repoUrl }: { repoUrl: string | null}) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`git clone ${repoUrl}`)
    toast.success("Copied to clipboard")
  }

  return (
    <div className="relative w-full rounded-md border bg-muted px-4 py-3 font-mono text-sm">
      <code className="block overflow-x-auto">
        {`git clone ${repoUrl}`}
      </code>

      <Button
        variant="ghost"
        size="icon"
        onClick={copyToClipboard}
        className="absolute right-2 top-2"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  )
}
