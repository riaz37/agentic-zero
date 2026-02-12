import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'AgenticWebCore',
            fileName: 'index',
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: [
                'react',
                'react/jsx-runtime',
                'react-dom',
                'react-dom/client',
                'three',
                '@react-three/fiber',
                '@react-three/drei',
                'xstate',
                '@xstate/react',
                'framer-motion',
                'gsap',
                'ai'
            ],
            output: {
                banner: "'use client';",
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    three: 'THREE',
                },
            },
        },
    },
});
