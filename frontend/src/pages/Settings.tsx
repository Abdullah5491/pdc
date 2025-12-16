import { useState, useEffect } from "react"
import { Save, Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ChatSettings {
    similarityThreshold: number
    maxContextMessages: number
}

const DEFAULT_SETTINGS: ChatSettings = {
    similarityThreshold: 0.25,
    maxContextMessages: 6
}

export default function Settings() {
    const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS)

    useEffect(() => {
        const saved = localStorage.getItem("chatSettings")
        if (saved) {
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
            } catch (e) {
                console.error("Failed to parse settings", e)
            }
        }
    }, [])

    const handleSave = () => {
        localStorage.setItem("chatSettings", JSON.stringify(settings))
        alert("Settings saved!")
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        RAG Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure how the AI retrieves and processes information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="threshold">Similarity Threshold ({settings.similarityThreshold})</Label>
                            <span className="text-sm text-muted-foreground">Higher = More strict</span>
                        </div>
                        <input
                            id="threshold"
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                            value={settings.similarityThreshold}
                            onChange={(e) => setSettings({ ...settings, similarityThreshold: parseFloat(e.target.value) })}
                        />
                        <p className="text-sm text-muted-foreground">
                            Minimum similarity score for a document to be considered relevant.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="context">Max Context Messages</Label>
                        <Input
                            id="context"
                            type="number"
                            min="0"
                            max="20"
                            value={settings.maxContextMessages}
                            onChange={(e) => setSettings({ ...settings, maxContextMessages: parseInt(e.target.value) })}
                        />
                        <p className="text-sm text-muted-foreground">
                            Number of previous messages to include in the context.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleSave} className="w-full">
                            <Save className="mr-2 h-4 w-4" />
                            Save Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
