import fetch from 'node-fetch';
import { config } from 'dotenv';
config();

const API_URL = 'https://azuregpts.azurewebsites.net/api/gpts/image/generate';
const API_TOKEN = process.env.AZURE_IMAGE_API_KEY;
const CONTAINER = process.env.IMAGE_CONTAINER || 'test-container';
const STYLES = ['vivid', 'natural'];

export async function generatePoster(sysmsg, prompt) {
    const style = STYLES[Math.floor(Math.random() * STYLES.length)];
    const body = {
        sysmsg: sysmsg,
        prompt: prompt,
        model: 'gpt-4o',
        quality: 'hd',
        size: '1024x1024',
        style,
        container_name: CONTAINER,
        expiry_hours: 24 * 365 * 10
    };

    const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error(`Image API error: ${resp.status}`);
    const result = await resp.json();
    if (result.code !== 0 || !result.data?.[0]) {
        throw new Error('Invalid image API response');
    }
    return result.data[0];
}
