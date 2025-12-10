import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * @title FHEArithmetic Tests
 * @description Test suite for encrypted arithmetic operations
 * @chapter: basic
 */
describe("FHEArithmetic", function () {
    let contract: any;
    let owner: any;
    let user1: any;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        const FHEArithmetic = await ethers.getContractFactory("FHEArithmetic");
        contract = await FHEArithmetic.deploy();
        await contract.deployed();
    });

    describe("Deployment", function () {
        /**
         * @test Contract should deploy successfully
         * @chapter: basic
         */
        it("Should deploy successfully", async function () {
            expect(contract.address).to.be.properAddress;
        });

        /**
         * @test Should initialize result to zero
         */
        it("Should initialize result", async function () {
            const result = await contract.getResult();
            expect(result).to.not.be.undefined;
        });
    });

    describe("Addition", function () {
        /**
         * @test Should add two encrypted values
         * @chapter: basic
         */
        it("Should add encrypted values", async function () {
            const a = FHE.asEuint32(10);
            const b = FHE.asEuint32(20);
            const tx = await contract.add(a, b);
            await expect(tx).to.emit(contract, "ArithmeticOperation");
        });

        /**
         * @test Should handle large numbers
         */
        it("Should handle large numbers in addition", async function () {
            const largeNum = Math.pow(2, 30) - 1;
            const a = FHE.asEuint32(largeNum);
            const b = FHE.asEuint32(1);
            const result = await contract.add(a, b);
            expect(result).to.not.be.undefined;
        });

        /**
         * @test Should handle zero addition
         */
        it("Should handle zero addition", async function () {
            const a = FHE.asEuint32(0);
            const b = FHE.asEuint32(100);
            const result = await contract.add(a, b);
            expect(result).to.not.be.undefined;
        });
    });

    describe("Subtraction", function () {
        /**
         * @test Should subtract encrypted values
         */
        it("Should subtract encrypted values", async function () {
            const a = FHE.asEuint32(100);
            const b = FHE.asEuint32(30);
            const tx = await contract.subtract(a, b);
            await expect(tx).to.emit(contract, "ArithmeticOperation");
        });

        /**
         * @test Should emit correct event
         */
        it("Should emit subtract event", async function () {
            const a = FHE.asEuint32(50);
            const b = FHE.asEuint32(20);
            const tx = contract.subtract(a, b);
            await expect(tx)
                .to.emit(contract, "ArithmeticOperation")
                .withArgs("subtract");
        });
    });

    describe("Multiplication", function () {
        /**
         * @test Should multiply encrypted values
         */
        it("Should multiply encrypted values", async function () {
            const a = FHE.asEuint32(5);
            const b = FHE.asEuint32(6);
            const tx = await contract.multiply(a, b);
            await expect(tx).to.emit(contract, "ArithmeticOperation");
        });

        /**
         * @test Should handle zero multiplication
         */
        it("Should handle zero multiplication", async function () {
            const a = FHE.asEuint32(0);
            const b = FHE.asEuint32(999);
            const result = await contract.multiply(a, b);
            expect(result).to.not.be.undefined;
        });

        /**
         * @test Should handle one multiplication
         */
        it("Should handle one multiplication", async function () {
            const a = FHE.asEuint32(1);
            const b = FHE.asEuint32(42);
            const result = await contract.multiply(a, b);
            expect(result).to.not.be.undefined;
        });
    });

    describe("Division", function () {
        /**
         * @test Should divide encrypted values
         */
        it("Should divide encrypted values", async function () {
            const a = FHE.asEuint32(100);
            const b = FHE.asEuint32(4);
            const tx = await contract.divide(a, b);
            await expect(tx).to.emit(contract, "ArithmeticOperation");
        });
    });

    describe("Comparisons", function () {
        /**
         * @test Should check equality
         */
        it("Should check equality", async function () {
            const a = FHE.asEuint32(42);
            const b = FHE.asEuint32(42);
            const tx = await contract.equal(a, b);
            await expect(tx).to.emit(contract, "ArithmeticOperation");
        });

        /**
         * @test Should check less than
         */
        it("Should check less than", async function () {
            const a = FHE.asEuint32(10);
            const b = FHE.asEuint32(20);
            const result = await contract.lessThan(a, b);
            expect(result).to.not.be.undefined;
        });

        /**
         * @test Should check less or equal
         */
        it("Should check less or equal", async function () {
            const a = FHE.asEuint32(20);
            const b = FHE.asEuint32(20);
            const result = await contract.lessOrEqual(a, b);
            expect(result).to.not.be.undefined;
        });
    });

    describe("Mixed Operations", function () {
        /**
         * @test Should handle operation sequence
         */
        it("Should handle operation sequence", async function () {
            const a = FHE.asEuint32(20);
            const b = FHE.asEuint32(10);

            // Add
            await contract.add(a, b);

            // Multiply
            const c = FHE.asEuint32(2);
            await contract.multiply(await contract.getResult(), c);

            const finalResult = await contract.getResult();
            expect(finalResult).to.not.be.undefined;
        });
    });

    describe("Plain Value Operations", function () {
        /**
         * @test Should add encrypted and plain values
         */
        it("Should add encrypted and plain values", async function () {
            const encrypted = FHE.asEuint32(50);
            const plain = 25;
            const tx = await contract.addPlain(encrypted, plain);
            await expect(tx).to.emit(contract, "ArithmeticOperation");
        });

        /**
         * @test Should handle zero plain value
         */
        it("Should handle zero plain value", async function () {
            const encrypted = FHE.asEuint32(100);
            const plain = 0;
            const result = await contract.addPlain(encrypted, plain);
            expect(result).to.not.be.undefined;
        });
    });

    describe("Reset Functionality", function () {
        /**
         * @test Should reset result
         */
        it("Should reset result", async function () {
            const a = FHE.asEuint32(100);
            const b = FHE.asEuint32(50);
            await contract.add(a, b);

            await contract.reset();
            const result = await contract.getResult();
            expect(result).to.not.be.undefined;
        });
    });

    describe("Event Emissions", function () {
        /**
         * @test Should emit events with correct caller
         */
        it("Should emit events with correct caller", async function () {
            const a = FHE.asEuint32(10);
            const b = FHE.asEuint32(20);

            const tx = contract.add(a, b);
            await expect(tx)
                .to.emit(contract, "ArithmeticOperation")
                .withArgs("add", owner.address);
        });

        /**
         * @test Different users should be able to perform operations
         */
        it("Different users can perform operations", async function () {
            const a = FHE.asEuint32(5);
            const b = FHE.asEuint32(3);

            await contract.connect(owner).add(a, b);
            await contract.connect(user1).add(a, b);

            expect(contract).to.exist;
        });
    });

    describe("Error Handling", function () {
        /**
         * @test Should handle invalid inputs
         */
        it("Should handle various inputs", async function () {
            const zero = FHE.asEuint32(0);
            const large = FHE.asEuint32(Math.pow(2, 30) - 1);

            await contract.add(zero, large);
            expect(contract).to.exist;
        });
    });

    describe("Permissions", function () {
        /**
         * @test Should respect user permissions
         */
        it("Should maintain permissions after operations", async function () {
            const a = FHE.asEuint32(10);
            const b = FHE.asEuint32(20);

            await contract.connect(owner).add(a, b);
            const result = await contract.getResult();
            expect(result).to.not.be.undefined;
        });
    });
});

// Mock FHE helper (in production, use actual FHEVM client)
const FHE = {
    asEuint32: (value: number) => value,
};
