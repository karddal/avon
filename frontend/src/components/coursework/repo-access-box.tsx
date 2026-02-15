import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface repoAccessBox {
  repoUrl: string | null;
  repoSsh: string | null;
}

export default function RepoAccessBox({ repoUrl, repoSsh }: repoAccessBox) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`git clone ${repoUrl}`)
    toast.success("Copied to clipboard")
  }

  return (
      <Tabs defaultValue="https">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="https" className="w-full">HTTPS</TabsTrigger>
          <TabsTrigger value="ssh" className="w-full">SSH</TabsTrigger>
        </TabsList>
        <TabsContent value="https">
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
        </TabsContent>
        <TabsContent value="ssh">
          <div className="relative w-full rounded-md border bg-muted px-4 py-3 font-mono text-sm">
            <code className="block overflow-x-auto">
              {`git clone ${repoSsh}`}
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
        </TabsContent>
      </Tabs>
  )
}
