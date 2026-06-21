import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Greeting from './Greeting.svelte';

describe('Greeting component (DOM environment proof)', () => {
	it('mounts a Svelte 5 component and renders text', () => {
		render(Greeting, { props: { name: 'World' } });
		expect(screen.getByText('Hello World')).toBeInTheDocument();
	});
});
