'use client';

import { useEffect } from 'react';

export default function MotionLayer() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const progress = document.querySelector<HTMLElement>('.scroll-progress');
    const hero = document.querySelector<HTMLElement>('.flight-section');
    const heroSticky = hero?.querySelector<HTMLElement>('.flight-sticky');
    const root = document.documentElement;
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const distance = Math.max(1, root.scrollHeight - window.innerHeight);
      progress?.style.setProperty('--progress', String(window.scrollY / distance));
      if (hero && heroSticky) {
        const heroTop = window.scrollY + hero.getBoundingClientRect().top;
        const heroDistance = Math.max(1, hero.offsetHeight - heroSticky.offsetHeight);
        const heroProgress = reduced ? 0 : Math.min(1, Math.max(0, (window.scrollY - heroTop) / heroDistance));
        const titleExit = Math.min(1, Math.max(0, (heroProgress - .42) / .38));
        heroSticky.style.setProperty('--hero-title-y', `${(-46 * titleExit).toFixed(1)}px`);
        heroSticky.style.setProperty('--hero-title-opacity', String(1 - titleExit * .82));
        heroSticky.style.setProperty('--hero-title-blur', `${(titleExit * 2.2).toFixed(1)}px`);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateProgress();
    if (reduced) return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    root.classList.add('motion-ready');
    const reveals = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(element => observer.observe(element));

    const tiltTargets = [...document.querySelectorAll<HTMLElement>('[data-tilt]')];
    const cleanups = tiltTargets.map(element => {
      const move = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        element.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
        element.style.setProperty('--tilt-y', `${(x * 7).toFixed(2)}deg`);
        element.style.setProperty('--light-x', `${((x + .5) * 100).toFixed(1)}%`);
        element.style.setProperty('--light-y', `${((y + .5) * 100).toFixed(1)}%`);
      };
      const leave = () => {
        element.style.setProperty('--tilt-x', '0deg');
        element.style.setProperty('--tilt-y', '0deg');
      };
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', leave);
      return () => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); };
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
      observer.disconnect();
      cleanups.forEach(cleanup => cleanup());
      root.classList.remove('motion-ready');
    };
  }, []);
  return <div className="scroll-progress" aria-hidden="true" />;
}
