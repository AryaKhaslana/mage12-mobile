import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/services/api.ts'
with open(filepath, 'r') as f:
    content = f.read()

# Replace getPublicUserProfile
old_profile = """export const getPublicUserProfile = async (userId: number): Promise<PublicUserProfile> => {
  const response = await api.get(`/user/${userId}`);
  return response.data.data ?? response.data;
};"""
new_profile = """export const getPublicUserProfile = async (username: string): Promise<PublicUserProfile> => {
  const response = await api.get(`/user/profile/${username}`);
  return response.data.data ?? response.data;
};"""
content = content.replace(old_profile, new_profile)

# Replace getUserCommunityPosts
old_posts = """export const getUserCommunityPosts = async (userId: number, page: number = 1, limit: number = 10) => {
  const response = await api.get(`/community/user/${userId}`, { params: { page, limit } });
  return response.data as { meta?: any; data: CommunityPost[] };
};"""
new_posts = """export const getUserCommunityPosts = async (username: string, page: number = 1, limit: number = 10) => {
  const response = await api.get(`/community/user/${username}`, { params: { page, limit } });
  return response.data as { meta?: any; data: CommunityPost[] };
};"""
content = content.replace(old_posts, new_posts)

# Replace getUserPublicTanaman (if it exists)
old_tanaman = """export const getUserPublicTanaman = async (userId: number) => {
  const response = await api.get(`/tanaman/user/${userId}`);
  return response.data.data ?? response.data;
};"""
new_tanaman = """export const getUserPublicTanaman = async (username: string) => {
  const response = await api.get(`/tanaman/user/${username}`);
  return response.data.data ?? response.data;
};"""
content = content.replace(old_tanaman, new_tanaman)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated api.ts")
