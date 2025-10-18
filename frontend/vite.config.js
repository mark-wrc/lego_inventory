import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:5000',
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
