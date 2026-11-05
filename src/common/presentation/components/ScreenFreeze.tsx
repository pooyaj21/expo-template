import { ReactNode, Suspense, useEffect, useState } from "react";
import { useNavigationState } from "@react-navigation/native";
import { Loading } from "@/common/presentation/components/Loading";

const FREEZE_MIN_DEPTH = 2;
const FREEZE_DELAY_MS = 1500;

const pendingForever = { then() {} };

const Suspender = ({
  frozen,
  children,
}: {
  frozen: boolean;
  children: ReactNode;
}) => {
  if (frozen) throw pendingForever;
  return children;
};

type ScreenFreezeProps = {
  routeKey: string;
  children: ReactNode;
};

const ScreenFreeze = ({ routeKey, children }: ScreenFreezeProps) => {
  const depth = useNavigationState((state) => {
    const index = state.routes.findIndex((route) => route.key === routeKey);
    return index === -1 ? 0 : state.index - index;
  });
  const canFreeze = depth >= FREEZE_MIN_DEPTH;
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!canFreeze) return;
    const id = setTimeout(() => setSettled(true), FREEZE_DELAY_MS);
    return () => {
      clearTimeout(id);
      setSettled(false);
    };
  }, [canFreeze]);

  return (
    <Suspense fallback={canFreeze ? null : <Loading />}>
      <Suspender frozen={canFreeze && settled}>{children}</Suspender>
    </Suspense>
  );
};

export default ScreenFreeze;
