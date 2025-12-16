import { useEffect, useState } from "react"
import axios from "axios"
import { Trash2, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

interface Document {
    name: string
    size: number
    created_at: number
}

export default function Documents() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            const res = await axios.get("http://localhost:8000/documents")
            setDocuments(res.data)
        } catch (error) {
            console.error("Failed to fetch documents", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return

        try {
            await axios.delete(`http://localhost:8000/documents/${filename}`)
            setDocuments(prev => prev.filter(d => d.name !== filename))
        } catch (error) {
            console.error("Failed to delete document", error)
            alert("Failed to delete document")
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Uploaded Files
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No documents uploaded yet. Go to Chat to upload files.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Filename</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => (
                                    <TableRow key={doc.name}>
                                        <TableCell className="font-medium">{doc.name}</TableCell>
                                        <TableCell>{formatSize(doc.size)}</TableCell>
                                        <TableCell>
                                            {formatDistanceToNow(new Date(doc.created_at * 1000), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(doc.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
