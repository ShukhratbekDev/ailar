"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type Tag = {
    id: string;
    text: string;
};

type TagInputProps = {
    placeholder?: string;
    tags: Tag[];
    setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
    className?: string;
};

export const TagInput = ({ placeholder, tags, setTags, className }: TagInputProps) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = (tag: Tag) => {
        setTags(tags.filter((s) => s.id !== tag.id));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (input.value === "" && tags.length > 0) {
                    setTags(tags.slice(0, -1));
                }
            }
            if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const newTagText = input.value.trim();
                if (newTagText) {
                    if (!tags.some((tag) => tag.text === newTagText)) {
                        setTags([...tags, { id: newTagText, text: newTagText }]);
                    }
                    setInputValue("");
                }
            }
        }
    };

    const selectTag = (text: string) => {
        if (!tags.some((tag) => tag.text === text)) {
            setTags([...tags, { id: text, text: text }]);
            setInputValue("");
        }
    };

    return (
        <Command onKeyDown={handleKeyDown} className={`overflow-visible bg-transparent ${className}`}>
            <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                            {tag.text}
                            <button
                                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleUnselect(tag);
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={() => handleUnselect(tag)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        placeholder={placeholder}
                        className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>
        </Command>
    );
};
