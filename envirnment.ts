// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = process.env as any
const envirnment = {
    api_url: env.NEXT_PUBLIC_API_URL || env.API_URL
}

export default envirnment