import type { User } from '@privy-io/react-auth';

export function generateUsername(name: string): string {
  if (!name) return "";
  const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomNum = Math.floor(Math.random() * 10000);
  return `${baseName}${randomNum}`;
}

export function getAuthProviderText(user: User | null): string {
  if (!user) return "";

  if (user.email?.address) return "Email";
  if (user.wallet?.address) return "Wallet";
  if (user.twitter?.username) return "Twitter";
  if (user.discord?.username) return "Discord";
  if (user.github?.username) return "GitHub";
  if (user.phone?.number) return "Phone";

  return "Privy";
}
