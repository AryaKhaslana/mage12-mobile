with open('services/api.ts', 'r') as f:
    content = f.read()

new_api = """export interface CommunityPost {
  id: number;
  userId: number;
  user_nama: string;
  tipePost: "progress_update" | "panen_surplus" | "pertanyaan";
  deskripsi: string;
  fotoUrl: string | null;
  createdAt: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export const getCommunityPosts = async (latitude: number, longitude: number, page: number = 1, limit: number = 10) => {
  const response = await api.get("/community", { params: { latitude, longitude, page, limit } });
  return response.data;
};
"""

content = content.replace('export const getWeatherToday = async (): Promise<any> => {\n  const response = await api.get("/weather/today");\n  return response.data.data;\n};', 'export const getWeatherToday = async (): Promise<any> => {\n  const response = await api.get("/weather/today");\n  return response.data.data;\n};\n\n' + new_api)

with open('services/api.ts', 'w') as f:
    f.write(content)
