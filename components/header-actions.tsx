'use client';

import * as React from 'react';
import { Moon, Sun, User, LogIn } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HeaderActions() {
  const { setTheme, theme } = useTheme();

  return (
    <TooltipProvider delayDuration={0}>
      <div className='flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className='cursor-pointer'
            >
              <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
              <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
              <span className='sr-only'>Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 transition-colors [&_[data-slot=tooltip-arrow]]:hidden">
            Mavzuni o'zgartirish
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' className='cursor-pointer'>
              <User className='h-[1.2rem] w-[1.2rem]' />
              <span className='sr-only'>User profile</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 transition-colors [&_[data-slot=tooltip-arrow]]:hidden">
            Profil
          </TooltipContent>
        </Tooltip>

       {/*  <Button variant='secondary' className='flex items-center gap-2 cursor-pointer'>
          <span>Kirish</span>
          <LogIn className='h-4 w-4' />
        </Button> */}
      </div>
    </TooltipProvider>
  );
}
