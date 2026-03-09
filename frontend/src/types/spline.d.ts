import 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'spline-viewer': any;
        }
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'spline-viewer': any;
        }
    }
}
