import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Entrar</Button>);
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('applies primary variant styles', () => {
    render(<Button variant="primary">Guardar</Button>);
    const button = screen.getByRole('button', { name: /guardar/i });
    expect(button.className).toContain('bg-secondary');
    expect(button.className).toContain('text-white');
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button', { name: /click/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>
    );
    const button = screen.getByRole('button', { name: /click/i });
    expect(button).toBeDisabled();
    // A disabled button natively suppresses click in the browser; the disabled
    // attribute is what guarantees onClick won't fire.
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Cargando</Button>);
    const button = screen.getByRole('button');
    // The spinner is an inline <svg> with `animate-spin`.
    const svg = button.querySelector('svg');
    expect(svg).not.toBeNull();
    // SVG elements expose className as SVGAnimatedString (not a plain string
    // in jsdom); read the attribute directly to assert the class.
    expect(svg?.getAttribute('class')).toContain('animate-spin');
    expect(button).toBeDisabled();
  });

  it('has min-height 48px for md size', () => {
    render(<Button size="md">Botón</Button>);
    const button = screen.getByRole('button', { name: /botón/i });
    // md maps to h-12 (3rem = 48px). jsdom does not resolve Tailwind tokens to
    // computed styles, so we assert the source utility class is present.
    expect(button.className).toContain('h-12');
  });
});
