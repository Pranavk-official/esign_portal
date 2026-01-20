"use client"

import { useState } from "react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
} from "@/components/ui/sidebar"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronUp, LogOut } from "lucide-react"

type UserMenuItem = {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

type UserMenuProps = {
    name: string
    menuItems: UserMenuItem[]
}

export function UserMenu({ name, menuItems }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { state } = useSidebar()

    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()

    // When sidebar is collapsed, show dropdown menu
    if (state === "collapsed") {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">{name}</span>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="right"
                            align="end"
                            className="w-56"
                        >
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.title} asChild>
                                    <a href={item.href}>
                                        <item.icon className="mr-2 h-4 w-4" />
                                        <span>{item.title}</span>
                                    </a>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    // When sidebar is expanded, show collapsible menu
    return (
        <SidebarMenu>
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={name}>
                            <Avatar className="h-6 w-6">
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <span>{name}</span>
                            <ChevronUp className={`ml-auto transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {menuItems.map((item) => (
                                <SidebarMenuSubItem key={item.title}>
                                    <SidebarMenuSubButton asChild>
                                        <a href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}

                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className="text-red-600">
                                    <a href="#">
                                        <LogOut className="h-4 w-4" />
                                        <span>Sign out</span>
                                    </a>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenu>
    )
}
