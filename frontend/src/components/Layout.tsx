import { useState, useEffect } from "react"
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { cn } from "@/lib/utils"
import {
    MessageSquare,
    BarChart3,
    FileText,
    Settings,
    Menu,
    X,
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [chats, setChats] = useState<any[]>([])
    const location = useLocation()
    const navigate = useNavigate()

    const fetchChats = async () => {
        try {
            const res = await axios.get("http://localhost:8000/chats")
            setChats(res.data.chats)
        } catch (error) {
            console.error("Failed to fetch chats", error)
        }
    }

    const deleteChat = async (id: string) => {
        try {
            await axios.delete(`http://localhost:8000/chats/${id}`)
            setChats(prev => prev.filter(c => c.id !== id))
            if (location.pathname === `/chat/${id}`) {
                navigate("/")
            }
        } catch (error) {
            console.error("Failed to delete chat", error)
        }
    }

    useEffect(() => {
        fetchChats()
    }, [location.pathname]) // Refresh when location changes (in case new chat created)

    const navItems = [
        { name: "Chat", icon: MessageSquare, path: "/" },
        { name: "Analytics", icon: BarChart3, path: "/analytics" },
        { name: "Documents", icon: FileText, path: "/documents" },
        { name: "Settings", icon: Settings, path: "/settings" },
    ]

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
                    isSidebarOpen ? "block" : "hidden"
                )}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-14 items-center border-b px-6">
                    <MessageSquare className="mr-2 h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">RAG Chat</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-col gap-2 p-4">
                    <Button className="w-full justify-start gap-2 mb-4" size="lg">
                        <Plus className="h-4 w-4" /> New Chat
                    </Button>

                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                    )
                                }
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>

                    <div className="mt-8 flex-1 overflow-y-auto">
                        <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                            Recent Chats
                        </h4>
                        <div className="space-y-1">
                            {chats.map((chat) => (
                                <div key={chat.id} className="group flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "flex-1 justify-start text-xs font-normal h-8 px-2 truncate",
                                            location.pathname === `/chat/${chat.id}` ? "bg-accent text-accent-foreground" : ""
                                        )}
                                        onClick={() => navigate(`/chat/${chat.id}`)}
                                    >
                                        {chat.title || "New Chat"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteChat(chat.id)
                                        }}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold capitalize">
                            {navItems.find(i => i.path === location.pathname)?.name || "Dashboard"}
                        </h1>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
