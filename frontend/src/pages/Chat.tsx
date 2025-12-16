import { useState, useRef, useEffect } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Send, Paperclip, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useParams, useNavigate } from "react-router-dom"

interface Message {
    role: "user" | "assistant"
    content: string
}

export default function Chat() {
    const { chatId: paramChatId } = useParams()
    const navigate = useNavigate()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [chatId, setChatId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (paramChatId) {
            loadChat(paramChatId)
        } else {
            createChat()
        }
    }, [paramChatId])

    const loadChat = async (id: string) => {
        try {
            setChatId(id)
            const res = await axios.get(`http://localhost:8000/chats/${id}`)
            // Map backend messages to frontend format if needed, assuming backend returns list of {role, content}
            const loadedMessages = res.data.messages.map((m: any) => ({
                role: m.role,
                content: m.content
            }))
            setMessages(loadedMessages)
        } catch (error) {
            console.error("Failed to load chat", error)
            // If not found, redirect to new chat
            navigate("/")
        }
    }

    const createChat = async () => {
        try {
            const res = await axios.post("http://localhost:8000/chats")
            setChatId(res.data.id)
            setMessages([
                {
                    role: "assistant",
                    content: "Hello! I am your RAG Chat assistant. Upload a PDF document to get started or ask me anything."
                }
            ])
        } catch (error) {
            console.error("Failed to create chat", error)
        }
    }

    const handleSend = async () => {
        if (!input.trim() || !chatId) return

        const userMessage: Message = { role: "user", content: input }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const savedSettings = localStorage.getItem("chatSettings")
            const settings = savedSettings ? JSON.parse(savedSettings) : {}

            const res = await axios.post("http://localhost:8000/chat", {
                query: userMessage.content,
                chat_id: chatId,
                similarity_threshold: settings.similarityThreshold
            })

            const assistantMessage: Message = {
                role: "assistant",
                content: res.data.response
            }
            setMessages((prev) => [...prev, assistantMessage])
        } catch (error) {
            console.error("Failed to send message", error)
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        // Add a system message about upload
        setMessages((prev) => [...prev, { role: "assistant", content: `Uploading ${file.name}...` }])

        try {
            const res = await axios.post("http://localhost:8000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            setMessages((prev) => [...prev, {
                role: "assistant",
                content: `Successfully processed ${file.name}. ${res.data.chunks} chunks created.`
            }])
        } catch (error) {
            console.error("Upload failed", error)
            setMessages((prev) => [...prev, { role: "assistant", content: "Upload failed." }])
        }
    }

    return (
        <div className="flex flex-col h-full gap-4 max-w-4xl mx-auto">
            <ScrollArea className="flex-1 rounded-lg border bg-card p-4 shadow-sm">
                <div className="space-y-4">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-start gap-3",
                                msg.role === "user" ? "flex-row-reverse" : ""
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}
                            >
                                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div
                                className={cn(
                                    "rounded-lg px-4 py-2 max-w-[80%] text-sm overflow-hidden",
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground"
                                )}
                            >
                                <div className="prose dark:prose-invert max-w-none break-words">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="bg-muted px-4 py-2 rounded-lg">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <Card className="p-2 flex gap-2 items-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileUpload}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload PDF"
                >
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                    placeholder="Ask a question about your documents..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </Card>
        </div>
    )
}
