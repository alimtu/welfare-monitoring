import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AppAvatarComponent({ data }) {
  return (
    <Avatar className={`${data?.className}  h-full w-full`}>
      <AvatarImage src={data?.pic} alt={data?.name} className="object-cover" />
      <AvatarFallback>{data?.name}</AvatarFallback>
    </Avatar>
  );
}
