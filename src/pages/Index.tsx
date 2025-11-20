import PolaroidCamera from '../components/PolaroidCamera';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
          复古拍立得相机
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          拍摄照片，拖动到页面上创建你的照片墙
        </p>
      </div>

      {/* Polaroid Camera Component */}
      <PolaroidCamera />
    </div>
  );
};

export default Index;
