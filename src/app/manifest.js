export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: 'Fleet-Steuer',
    short_name: 'Fleet-Steuer',
    description: 'App zur Erfassung von steuerlichen Ausgaben',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
