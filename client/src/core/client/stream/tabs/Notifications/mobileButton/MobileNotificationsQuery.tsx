import { Localized } from "@fluent/react/compat";
import { once } from "lodash";
import React, { FunctionComponent, Suspense } from "react";
import { graphql } from "react-relay";

import { QueryRenderData, QueryRenderer } from "coral-framework/lib/relay";
import { Delay, Spinner } from "coral-ui/components/v2";
import { QueryError } from "coral-ui/components/v3";

import { MobileNotificationsQuery as QueryTypes } from "coral-stream/__generated__/MobileNotificationsQuery.graphql";

const loadNotificationsContainer = () =>
  import(
    "./MobileNotificationsContainer" /* webpackChunkName: "notifications" */
  );

// (cvle) For some reason without `setTimeout` this request will block other requests.
const preload = once(() =>
  setTimeout(() => {
    void loadNotificationsContainer();
  }, 0)
);

const LazyLoadContainer = React.lazy(loadNotificationsContainer);

export const render = (
  { error, props }: QueryRenderData<QueryTypes>,
  showUserBox: boolean,
  showTitle: boolean
) => {
  if (error) {
    return <QueryError error={error} />;
  }

  preload();

  if (!props) {
    return (
      <Delay>
        <Spinner />
      </Delay>
    );
  }

  if (!props.viewer) {
    return (
      <Localized id="notificationsQuery-errorLoading">
        <div>Error loading notifications</div>
      </Localized>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <LazyLoadContainer
        viewer={props.viewer}
        settings={props.settings}
        showUserBox={showUserBox}
        showTitle={showTitle}
      />
    </Suspense>
  );
};

interface Props {
  showUserBox?: boolean;
  showTitle?: boolean;
}

const NotificationsQuery: FunctionComponent<Props> = ({
  showUserBox = true,
  showTitle = true,
}) => {
  return (
    <QueryRenderer<QueryTypes>
      query={graphql`
        query MobileNotificationsQuery {
          viewer {
            ...MobileNotificationsContainer_viewer
          }
          settings {
            ...MobileNotificationsContainer_settings
          }
        }
      `}
      variables={{}}
      render={(data) => {
        return render(data, showUserBox, showTitle);
      }}
    />
  );
};

export default NotificationsQuery;
