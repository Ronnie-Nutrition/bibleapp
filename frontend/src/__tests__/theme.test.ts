import iOSTheme from '../theme/theme';

describe('iOS Theme', () => {
  it('has correct primary color', () => {
    expect(iOSTheme.colors.primary).toBe('#007AFF');
  });

  it('has complete color palette', () => {
    expect(iOSTheme.colors).toHaveProperty('primary');
    expect(iOSTheme.colors).toHaveProperty('success');
    expect(iOSTheme.colors).toHaveProperty('warning');
    expect(iOSTheme.colors).toHaveProperty('error');
    expect(iOSTheme.colors).toHaveProperty('systemGray6');
  });

  it('has iOS typography scales', () => {
    expect(iOSTheme.typography.largeTitle.fontSize).toBe('34px');
    expect(iOSTheme.typography.title1.fontSize).toBe('28px');
    expect(iOSTheme.typography.body.fontSize).toBe('17px');
  });

  it('has proper spacing system', () => {
    expect(iOSTheme.spacing.xs).toBe('4px');
    expect(iOSTheme.spacing.sm).toBe('8px');
    expect(iOSTheme.spacing.xl).toBe('20px');
  });

  it('has iOS border radius values', () => {
    expect(iOSTheme.borderRadius.medium).toBe('8px');
    expect(iOSTheme.borderRadius.large).toBe('12px');
  });

  it('has component size definitions', () => {
    expect(iOSTheme.sizes.buttonHeight).toBe('44px');
    expect(iOSTheme.sizes.tabBarHeight).toBe('83px');
  });
});