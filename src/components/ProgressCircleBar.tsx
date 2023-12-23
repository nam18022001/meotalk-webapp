import { ReactNode } from 'react';
import { CircularProgressbar, CircularProgressbarWithChildren } from 'react-circular-progressbar';

function ProgressCircleBar({
  type,
  value,
  maxValue,
  unit,
  className,
  fontSizeTextvalue,
  custom = false,
  children,
  strokeColor,
}: ProgressCircleBarProps) {
  return !custom ? (
    <CircularProgressbar
      className={`${className} w-[50px] h-[50px]`}
      value={value}
      text={`${value} ${unit}`}
      maxValue={maxValue}
      styles={{
        trail: {
          stroke: 'rgb(72, 81, 111)',
        },
        path: {
          stroke:
            type === 'red'
              ? 'rgb(249,65,104)'
              : type === 'blue'
              ? 'rgb(62, 169, 250)'
              : type === 'yellow'
              ? 'rgb(209, 250, 62)'
              : '',
        },
        text: {
          fontSize: fontSizeTextvalue ? fontSizeTextvalue : 25,
          fill:
            type === 'red'
              ? 'rgb(249,65,104)'
              : type === 'blue'
              ? 'rgb(62, 169, 250)'
              : type === 'yellow'
              ? 'rgb(209, 250, 62)'
              : '',
        },
      }}
    />
  ) : (
    <CircularProgressbarWithChildren
      className={`${className} w-[50px] h-[50px]`}
      value={value}
      maxValue={maxValue}
      styles={{
        trail: {
          stroke: strokeColor ? strokeColor : 'rgb(72, 81, 111)',
        },
        path: {
          stroke:
            type === 'red'
              ? 'rgb(249,65,104)'
              : type === 'blue'
              ? 'rgb(62, 169, 250)'
              : type === 'yellow'
              ? 'rgb(209, 250, 62)'
              : '',
        },
        text: {
          fontSize: fontSizeTextvalue ? fontSizeTextvalue : 25,
          fill:
            type === 'red'
              ? 'rgb(249,65,104)'
              : type === 'blue'
              ? 'rgb(62, 169, 250)'
              : type === 'yellow'
              ? 'rgb(209, 250, 62)'
              : '',
        },
      }}
    >
      {children}
    </CircularProgressbarWithChildren>
  );
}
interface ProgressCircleBarProps {
  type: 'blue' | 'red' | 'yellow';
  value: number;
  maxValue: number;
  unit: '%' | 's';
  className?: string;
  fontSizeTextvalue?: number;
  custom?: true | false;
  children?: ReactNode;
  strokeColor?: string;
}
export default ProgressCircleBar;
