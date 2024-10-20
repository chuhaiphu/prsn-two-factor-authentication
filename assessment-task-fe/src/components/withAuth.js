import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export function withAuth(WrappedComponent) {
  return function AuthComponent(props) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        router.push('/login');
      } else {
        try {
          const decodedToken = jwtDecode(JSON.parse(accessToken));
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            localStorage.removeItem('access_token');
            router.push('/login');
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          localStorage.removeItem('access_token');
          router.push('/login');
        }
      }
      setIsLoading(false);
    }, [router]);

    if (isLoading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
