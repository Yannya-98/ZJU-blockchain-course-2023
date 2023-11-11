import styled from "styled-components";
import React, {useEffect, useState} from 'react';
import {borrowYourCarContract, tapContract, web3} from "../../utils/contracts";
import './index.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const Button = styled.button`
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;

const Container = styled.div`
  max-width: 900px; /* 设置容器最大宽度 */
  margin: 0 auto; /* 居中容器 */
  padding: 20px; /* 添加内边距 */
`;

const StyledImg = styled.img`
  max-width: 100%; /* 图片最大宽度为容器宽度 */
  height: auto; /* 高度自适应以保持宽高比 */
`;

const ImageContainer = styled.div`
  width: 250px; /* 设置容器宽度 */
  height: 200px; /* 设置容器高度 */
  overflow: hidden; /* 隐藏超出容器范围的部分 */
`;

const IndexPage = () => {
    //保存用户账户和余额
    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    //获取用户输入
    const [queryCarId, setQueryCarId] = useState('');
    const [borrowCarId, setBorrowCarId] = useState('');
    const [time, setTime] = useState('');
    //保存用户拥有的车辆
    const [myCars, setMyCars] = useState<Car[]>([]);
    //保存当前空闲的车辆
    const [availableCars, setAvailableCars] = useState<Car[]>([]);
    class Car {
        constructor(public tokenId: number) {}
    }

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }
        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getInfo = async () => {
            if (tapContract) {
                const ab = await tapContract.methods.balanceOf(account).call()
                setAccountBalance(ab)
                //获取拥有的车辆
                let ownedCars = await borrowYourCarContract.methods.getOwnedCars().call({
                    from: account
                })
                const updatedMyCars = ownedCars.map((carId: number) => new Car(carId));
                setMyCars(updatedMyCars);
                //获取空闲车辆
                let availableCars = await borrowYourCarContract.methods.getAvailableCars().call({
                    from: account
                })
                const updatedAvailableCars = availableCars.map((carId: number) => new Car(carId));
                setAvailableCars(updatedAvailableCars);
            } else {
                alert("合约不存在")
            }
        }

        if(account !== '') {
            getInfo()
        }
    }, [account])

    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('钱包未连接')
            return
        }
        if (tapContract) {
            try {
                await tapContract.methods.airdrop().send({
                    from: account
                })
                alert('已领取自来水币')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('合约不存在')
        }
    }

    const mintCar = async () => {
        if(account === '') {
            alert('钱包未连接')
            return
        }

        if (borrowYourCarContract) {
            try {
                await borrowYourCarContract.methods.mintCar().send({
                    from: account
                })
                alert('新车辆添加成功')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('合约不存在')
        }
    }

    const queryCar = async () => {

        if(account === '') {
            alert('钱包未连接')
            return
        }

        if (borrowYourCarContract) {
            try {
                //查询车辆信息
                const owner = await borrowYourCarContract.methods.getOwner(queryCarId).call()
                const borrower = await borrowYourCarContract.methods.getBorrower(queryCarId).call()
                //输出查询结果
                if(owner === '0x0000000000000000000000000000000000000000'){
                    alert('输入了错误的ID，车辆不存在')
                }
                else if(borrower === '0x0000000000000000000000000000000000000000'){
                    alert('ID：' + queryCarId + '\n车主：' + owner + '\n状态：空闲' + '\n借用者：无')
                }
                else alert('ID：' + queryCarId + '\n车主：' + owner + '\n状态：已被借用' + '\n借用者：' + borrower)
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('合约不存在。')
        }
    }

    const borrowCar = async () => {

        if (account === '') {
            alert('钱包未连接')
            return
        }

        if (borrowYourCarContract && tapContract) {
            const owner = await borrowYourCarContract.methods.getOwner(borrowCarId).call()
            const borrower = await borrowYourCarContract.methods.getBorrower(borrowCarId).call()
            if(owner === account){
                alert('无法借用自己的车')
            }else if(borrower !== '0x0000000000000000000000000000000000000000'){
                alert('车辆已被借用')
            }else{
                await tapContract.methods.approve(borrowYourCarContract.options.address,time).send({
                    from: account
                })
                await borrowYourCarContract.methods.borrowCar(borrowCarId, parseInt(time)*60).send({
                    from: account
                })
                alert('借用成功。')
            }
        } else {
            alert('合约不存在。')
        }
    }

    const updateList = async () => {
        if(account === '') {
            alert('钱包未连接')
            return
        }

        if (borrowYourCarContract) {
            try {
                await borrowYourCarContract.methods.update().send({
                    from: account
                })
            } catch (error: any) {
                alert(error.message)
            }
            alert('车辆状态已更新\n请刷新页面以获取最新的列表')
        } else {
            alert('合约不存在')
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    return(
        <Container>
            <div className='main'>
                <h1>汽车租赁系统</h1>
                <Button onClick={onClaimTokenAirdrop}>领取自来水币空投</Button>
                <div className='account'>
                    <p>
                    {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                    </p>
                    <p>
                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    </p>
                    <div>当前用户拥有自来水币数量：{account === '' ? 0 : accountBalance}</div>
                    <p>
                        <Button onClick={mintCar}>添加新车</Button>
                    </p>
                </div>
                <div style={{marginBottom: '5px', fontWeight: 'bold', fontSize: '1.2em'}}>我的车辆</div>
                <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {myCars.map((car, index) => (
                        <li key={index} style={{ flex: '0 0 25%' }}>
                            <span>ID：{car.tokenId} </span>
                            <br></br>
                            <ImageContainer>
                                <StyledImg src={require(`./${car.tokenId+'.jpg'}`)} alt="Image" />
                            </ImageContainer>
                        </li>
                    ))}
                </ul>
                <div style={{marginBottom: '5px', fontWeight: 'bold', fontSize: '1.2em'}}>空闲车辆</div>
                <p>
                    <Button style={{width: '200px'}} onClick={updateList}>更新空闲车辆列表</Button>
                </p>
                <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {availableCars.map((car, index) => (
                        <li key={index} style={{ flex: '0 0 25%' }}>
                            <span>ID：{car.tokenId} </span>
                            <br></br>
                            <ImageContainer>
                                <StyledImg src={require(`./${car.tokenId+'.jpg'}`)} alt="Image" />
                            </ImageContainer>
                        </li>
                    ))}
                </ul>

                <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
                    <p>
                    <span>ID：</span>
                    <Input type="number" value={queryCarId} onChange={e => setQueryCarId(e.target.value)} />
                    </p>
                    <Button style={{width: '200px'}} onClick={queryCar}>查询车辆</Button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
                    <p>
                        <span>ID：</span>
                        <Input type="number" value={borrowCarId} onChange={e => setBorrowCarId(e.target.value)} />
                    </p>
                    <p>
                        <span>借用时间（min）：</span>
                        <Input type="number" value={time} onChange={e => setTime(e.target.value)} />
                    </p>
                    <p>
                        <Button style={{width: '200px'}} onClick={borrowCar}>借用</Button>
                    </p>
                </div>
            </div>
        </Container>
    )
}

export default IndexPage;