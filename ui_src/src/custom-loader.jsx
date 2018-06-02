import React from 'react';
import ReactDom from 'react-dom';
import styled from 'styled-components';
import 'loaders.css/loaders.css';
import Loader from 'react-loaders';

export default class CustomLoader extends React.Component {
  render() {
    let isActive = 'none';
    let color = null;

    if(this.props.active) isActive = 'block'

    if (this.props.color) {
      color = this.props.color
    }else {
      color = 'white';
    };

    const Wrapper = styled.div`
      position: relative;
    `;

    const LoaderWrapper = styled.div`
      &:before {
        content: '';
        background-color: ${ this.props.backgroundColor || 'black' };
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 99;
        border-radius: ${ this.props.borderRadius }
      }

      display: ${ isActive }
    `;

    const StyledLoader = styled.div`
      position: absolute;
      text-align: center;
      color: white;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 99;
    `;

    let textElement = null
    if (this.props.text) textElement = <div>{this.props.text}</div>

    return (
      <Wrapper>
        <LoaderWrapper>
          <StyledLoader>
          <Loader type="line-scale" active color={this.props.color} />
            {textElement}
          </StyledLoader>
        </LoaderWrapper>
        {this.props.children}
      </Wrapper>
    );
  }
}