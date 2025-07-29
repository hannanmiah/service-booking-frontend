declare module "#api" {
    type ApiResponse<T> = {
        data: T[];
        meta: {
            total: number;
            per_page: number;
            from: number;
            to: number;
            current_page: number;
            last_page: number;
            path: string;
            links: { url: string; label: string; active: boolean }[];
        };
        links: {
            first: string;
            last: string;
            next: string;
            prev: string;
        };
    };

    type User = {
        id: number;
        name: string;
        email: string;
        email_verified_at: string;
        is_admin: boolean;
        created_at: string;
        updated_at: string;
        bookings: Booking[];
    };

    type Service = {
        id: number;
        name: string;
        description: string;
        price: number;
        is_active: boolean;
        is_featured: boolean;
        created_at: string;
        updated_at: string;
        bookings: Booking[];
    }

    type Booking = {
        id: number;
        user_id: number;
        service_id: number;
        booking_date: string;
        status: string;
        created_at: string;
        updated_at: string;
        user: ?User;
        service: ?Service;
    }
}